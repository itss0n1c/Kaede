import { get_json } from '@kaede/utils';
import { join } from 'node:path';
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

const API_BASE = 'https://wallhaven.cc/api/v1';
const API_KEY = 'MzBug754NapY4oownnuLOETJjip2MbfY';

async function request<T>(path: string, _queries: Record<string, unknown> = {}): Promise<T> {
	const url = new URL(API_BASE);
	url.pathname = join(url.pathname, path);

	const queries = { ..._queries, apikey: API_KEY };
	for (const [key, value] of Object.entries(queries)) {
		url.searchParams.append(key, value);
	}
	console.log(url.toString());
	const json = await get_json<APIRes<T>>(url.toString());

	if (json.error) {
		throw new Error(json.error);
	}
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

export const get = async (id: string): Promise<WallpaperInfo> => request(`/w/${id}`);

export async function search(options: Partial<WallpaperSearch>): Promise<WallpaperSearchRes[]> {
	return request('/search', {
		...options,
		categories: _match_category(options.categories),
		purity: _match_purity(['sfw']),
		// purity: _match_purity(options.purity),
		ratios: _match_ratio(options.ratios),
	});
}

export async function search_with_info(options: Partial<WallpaperSearch>): Promise<WallpaperInfo[]> {
	return Promise.all((await search(options)).slice(0, 5).map((r) => get(r.id)));
}

export type * from './types';
