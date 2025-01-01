import { api_request_client, type ReqClientInit } from '@kaede/utils';
import { GIF_CATEGORY, IMAGE_CATEGORIES, IMAGE_CATEGORY, type ImageCategories, type ImageRes } from './types';

interface APIRes<T> {
	results: T[];
}

const _client = api_request_client('https://nekos.best');

async function request<T>(opts: ReqClientInit): Promise<T[]> {
	const data = await _client<APIRes<T>>(opts);
	if (!('results' in data)) throw new Error('Invalid response from API');
	return data.results;
}

async function images<ImageType extends keyof ImageCategories, K extends ImageCategories[ImageType][number]>(
	type: ImageType,
	category: K,
) {
	if (!(type in IMAGE_CATEGORIES)) throw new Error('Invalid image type');
	const type_categories = IMAGE_CATEGORIES[type] as readonly string[];
	if (!type_categories.includes(category)) throw new Error('Invalid category');

	return request<ImageRes>({ path: `/api/v2/${category}` });
}

export async function image<ImageType extends keyof ImageCategories, K extends ImageCategories[ImageType][number]>(
	type: ImageType,
	category: K,
) {
	const res = await images(type, category);
	if (!res.length) throw new Error('No results found');
	return res[0];
}

export async function get_categories<ImageType extends keyof ImageCategories>(type: ImageType) {
	return type === 'gif' ? GIF_CATEGORY : IMAGE_CATEGORY;
}

export type * from './types';
