import { get_json } from '@kaede/utils';
import { join } from 'node:path';
import {
	type NekoImage,
	type NekoImageCategories,
	NEKO_GIF_CATEGORY,
	NEKO_IMAGE_CATEGORIES,
	NEKO_IMAGE_CATEGORY,
} from './types';

interface NekoAPIRes<T> {
	results: T[];
}

const API_URL = 'https://nekos.best';

async function request<T>(path: string, query: Record<string, string> = {}): Promise<T[]> {
	const url = new URL(API_URL);
	url.pathname = join(url.pathname, path);
	for (const [key, value] of Object.entries(query)) {
		url.searchParams.set(key, value);
	}
	console.log(url.toString());
	const data = await get_json<NekoAPIRes<T>>(url.toString());
	if (!('results' in data)) throw new Error('Invalid response from API');
	return data.results;
}

async function images<ImageType extends keyof NekoImageCategories, K extends NekoImageCategories[ImageType][number]>(
	type: ImageType,
	category: K,
) {
	if (!(type in NEKO_IMAGE_CATEGORIES)) throw new Error('Invalid image type');
	const type_categories = NEKO_IMAGE_CATEGORIES[type] as readonly string[];
	if (!type_categories.includes(category)) throw new Error('Invalid category');

	return request<NekoImage>(`/api/v2/${category}`);
}

export async function image<
	ImageType extends keyof NekoImageCategories,
	K extends NekoImageCategories[ImageType][number],
>(type: ImageType, category: K) {
	const res = await images(type, category);
	if (!res.length) throw new Error('No results found');
	return res[0];
}

export async function get_categories<ImageType extends keyof NekoImageCategories>(type: ImageType) {
	return type === 'gif' ? NEKO_GIF_CATEGORY : NEKO_IMAGE_CATEGORY;
}

export type * from './types';
