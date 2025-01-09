import { AttachmentBuilder, dbs_root, fileType, get_buf, get_json, join, md5 } from '@kaede/utils';
import { BunDB } from 'bun.db';
import { anilist } from '../..';
import type { TraceItem, TraceRes } from './types';

export * from './types';

interface APIRes {
	frameCount: number;
	error: string;
	result: TraceItem[];
}

const db_path = join(dbs_root, 'trace.sqlite');
const cache = new BunDB(db_path);

export async function lookup(url: string): Promise<TraceRes> {
	const stream = await get_buf(url);

	const id = md5(stream.toString());
	const existing_data = await cache.get<TraceRes>(id);
	if (existing_data) {
		const duration = 1000 * 60 * 5;
		if (existing_data.added_at + duration > Date.now()) return existing_data;
		await cache.delete(id);
	}

	const type = await fileType.fileTypeFromBuffer(Uint8Array.from(stream));
	if (!type) {
		throw new Error('Invalid file');
	}
	if (!type.mime.startsWith('image/') && !type.mime.startsWith('video/')) {
		throw new Error('Not an image or video');
	}

	console.log({ url, type });

	const data = await get_json<APIRes>('https://api.trace.moe/search', {
		method: 'POST',
		body: stream,
		headers: {
			'Content-Type': type.mime,
		},
	});

	if (data.error.length > 0) {
		throw new Error(data.error);
	}

	const raw = data.result.map((d) => ({
		...d,
		id: md5(`${d.filename}-${d.from}-${d.to}`),
	}));

	const medias = await anilist.bulk_get(
		raw.map((r) => r.anilist),
		'ANIME',
	);

	const items: Array<TraceItem> = [];
	for (const r of raw) {
		const media = medias.find((m) => m.id === r.anilist);
		console.log(media);
		if (!media || media.isAdult || media.tags.some((t) => t.isAdult || (t.name === 'Nudity' && (t.rank ?? 0) > 40)))
			continue;
		items.push({
			...r,
			media,
		});
	}

	const trace_res: TraceRes = {
		added_at: Date.now(),
		id,
		url,
		items,
	};
	return cache.set(id, trace_res);
}

export async function get_video(id: string, v_id: string): Promise<AttachmentBuilder> {
	const res = await cache.get<TraceRes>(id);
	const item = res?.items.find((i) => i.id === v_id);
	if (!item) throw new Error('Not found');
	return new AttachmentBuilder(item.video, { name: item.filename });
}
