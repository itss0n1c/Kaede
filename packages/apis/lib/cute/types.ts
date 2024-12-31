export const NEKO_IMAGE_CATEGORY = ['husbando', 'kitsune', 'neko', 'waifu'] as const;
export const NEKO_GIF_CATEGORY = [
	'baka',
	'bite',
	'blush',
	'bored',
	'cry',
	'cuddle',
	'dance',
	'facepalm',
	'feed',
	'handhold',
	'handshake',
	'happy',
	'highfive',
	'hug',
	'kick',
	'kiss',
	'laugh',
	'lurk',
	'nod',
	'nom',
	'nope',
	'pat',
	'peck',
	'poke',
	'pout',
	'punch',
	'shoot',
	'shrug',
	'slap',
	'sleep',
	'smile',
	'smug',
	'stare',
	'think',
	'thumbsup',
	'tickle',
	'wave',
	'wink',
	'yawn',
	'yeet',
] as const;

export const NEKO_IMAGE_CATEGORIES = {
	img: NEKO_IMAGE_CATEGORY,
	gif: NEKO_GIF_CATEGORY,
} as const;

export type NekoImageCategories = typeof NEKO_IMAGE_CATEGORIES;

export interface NekoImage {
	artist_href?: string;
	artist_name?: string;
	source_url?: string;
	anime_name?: string;
	url: string;
}
