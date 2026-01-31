import { type } from 'arktype';
import type { AnilistMedia } from '../../anilist/index.ts';

const _type_trace_item_raw = type({
	id: 'string',
	anilist: type({
		id: 'number',
	}),
	filename: 'string',
	episode: 'number',
	from: 'number',
	at: 'number',
	to: 'number',
	duration: 'number',
	similarity: 'number',
	video: 'string',
	image: 'string',
});

export type TraceItemRaw = typeof _type_trace_item_raw.infer;

const _type_trace_item = _type_trace_item_raw.omit('anilist').and({
	anilist_id: 'number',
	media: type.unknown as type.cast<AnilistMedia>,
});
export type TraceItem = typeof _type_trace_item.infer;

export interface TraceRes {
	added_at: number;
	id: string;
	url: string;
	items: Array<TraceItem>;
}
