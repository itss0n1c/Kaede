import { api_request_client, get_text, type ReqClientInit, useragent } from '@kaede/utils';
import type { ZeroEntry, ZeroEntryList, ZeroSearchQuery } from './types';

export * from './types';

// 60 requests per minute
const rate_limit = 60;
let rate_limit_remaining = 60;
const rate_limit_reset = Date.now();

const _client = api_request_client('https://www.zerochan.net');

async function request<T>(opts: ReqClientInit): Promise<T> {
	if (rate_limit_remaining === 0) {
		const now = Date.now();
		if (now < rate_limit_reset) {
			await new Promise((resolve) => setTimeout(resolve, rate_limit_reset - now));
		}
		rate_limit_remaining = rate_limit;
	}
	rate_limit_remaining--;

	return _client({
		...opts,
		queries: {
			...opts.queries,
			json: '1',
		},
		headers: {
			'User-Agent': 'Kaede Discord Bot - s0n1c',
		},
	});
}

export async function suggestions(term: string) {
	// https://www.zerochan.net/suggest?q=yae&limit=10&timestamp=1689022055062
	const url = new URL('/suggest', 'https://www.zerochan.net/');
	url.searchParams.set('q', term);
	url.searchParams.set('limit', '10');
	url.searchParams.set('timestamp', Date.now().toString());
	const text = await get_text(url.toString(), {
		method: 'GET',
		headers: {
			'User-Agent': useragent({
				deviceCategory: 'desktop',
			}),
		},
	});
	if (!text.trim().length) return [];

	/*
	Yae Miko|Character|Genshin Impact
	Yae Sakura|Character|Houkai Gakuen
	Yaegashi Nan|Mangaka|-
	Yaezawa Natori (Channel)|VTuber|-
	Yaezawa Natori|Character|Yaezawa Natori (Channel)
	Coat|Theme|-
	Fangs|Theme|-
	*/

	const list: { name: string; type: string; source?: string }[] = [];
	for (const line of text.split('\n')) {
		if (!line.trim().length) continue;
		// Yae Miko|Character|Genshin Impact
		const [_name, _type, _source] = line.split('|');

		const name = _name.trim();
		const type = _type.trim();
		const source = _source.trim();

		list.push({
			name,
			type,
			...(source !== '-' ? { source } : {}),
		});
	}

	return list;
}

const tag_encode = (tag: string) => tag.replaceAll(/\s/g, '+');

export const search = (query: ZeroSearchQuery) =>
	request<ZeroEntryList>({ path: '/', queries: { ...query } }).then((res) => res.items ?? []);

const excluded_tags = ['navel', 'midriff', 'butt', 'ecchi'];

export const tag_info = (tag: string, strict = false) =>
	request<ZeroEntryList>({ path: `/${tag_encode(tag)}`, queries: { strict: strict ? '1' : '0' } })
		.then((res) => res.items ?? [])
		.then((r) => r.filter((e) => excluded_tags.every((t) => !e.tags.map((t) => t.toLowerCase()).includes(t))));

export const entry = (id: number) => request<ZeroEntry>({ path: `/${id}` });
