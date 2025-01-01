import { api_request_client, type ReqClientInit } from '@kaede/utils';
import type {
	WallpaperCategory,
	WallpaperInfo,
	WallpaperPurity,
	WallpaperRatio,
	WallpaperSearch,
	WallpaperSearchRes,
} from './types';

interface APIRes<T> {
	error?: string;
	data: T;
}

const _client = api_request_client('https://wallhaven.cc/api/v1');

async function request<T>(opts: ReqClientInit): Promise<T> {
	const json = await _client<APIRes<T>>(opts);
	if (json.error) throw new Error(json.error);
	return json.data;
}

const _match_category = (categories: WallpaperCategory[] = []): string =>
	`${categories.includes('general') ? '1' : '0'}${categories.includes('anime') ? '1' : '0'}${categories.includes('people') ? '1' : '0'}`;

const _match_purity = (purities: WallpaperPurity[] = []): string =>
	`${purities.includes('sfw') ? '1' : '0'}${purities.includes('sketchy') ? '1' : '0'}${purities.includes('nsfw') ? '1' : '0'}`;

function _match_ratio(ratios: WallpaperRatio = 'allwide'): string {
	const wide = ['16x9', '16x10'];
	const ultrawide = ['21x9', '32x9', '48x9'];
	const allwide = ['landscape'];
	const portrait = ['portrait'];
	const square = ['1x1', '3x2', '4x3', '5x4'];

	const sizes = { allwide, wide, ultrawide, portrait, square };

	return sizes[ratios].join(',');
}

export const get = async (id: string): Promise<WallpaperInfo> => request({ path: `/w/${id}` });

export async function search(options: Partial<WallpaperSearch>): Promise<WallpaperSearchRes[]> {
	return request({
		path: '/search',
		queries: {
			...options,
			categories: _match_category(options.categories),
			purity: _match_purity(['sfw']),
			ratios: _match_ratio(options.ratios),
		},
	});
}

export const search_with_info = (options: Partial<WallpaperSearch>) =>
	search(options)
		.then((r) => r.slice(0, 5).map((i) => get(i.id)))
		.then((r) => Promise.all(r));

export type * from './types';
