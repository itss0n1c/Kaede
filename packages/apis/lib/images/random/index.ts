import { get_json, } from '@kaede/utils';

const excluded = [
	'panties',
	'cleavage',
	'thighhighs',
	'navel',
	'breasts',
	'bondage',
	'bikini',
	'breast_hold',
	'swimsuit',
	'nopan',
	'bikini_top',
	'loli',
	'pussy',
	'shota',
] as const;

const excluded_authors = ['BattlequeenYume'];

interface ImageRes {
	file_url: string;
	file_size: number;
	md5: string;
	tags: string[];
	width: number;
	height: number;
	source?: string;
	author?: string;
	has_children: boolean;
	_id: number;
}

const clean_tags = (tags: string[]) => excluded.every((v) => !tags.includes(v));

export async function get(round = 0): Promise<ImageRes> {
	if (round >= 1) console.log(`Going for round ${round} of image fetching`);
	const url = new URL('/image.json', 'https://pic.re');
	url.searchParams.set('of', excluded.join(','));
	url.searchParams.set('compress', 'true');
	const res = await get_json<ImageRes>(url.toString());
	if (!clean_tags(res.tags)) return get(round + 1);
	if (!res.author) return res;
	if (excluded_authors.includes(res.author)) return get(round + 1);
	return res;
}
