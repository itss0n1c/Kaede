export const IMAGE_CATEGORY = ['husbando', 'kitsune', 'neko', 'waifu'] as const;
export const GIF_CATEGORY = [
	'baka', // ✅
	'bite', // ✅
	'blush', // ✅
	'bored', // ✅
	'cry', // ✅
	'cuddle', // ✅
	'dance', // ✅
	'facepalm',
	'feed', // ✅
	'handhold', // ✅
	'handshake', // ✅
	'happy', // ✅
	'highfive', // ✅
	'hug', // ✅
	'kick', // ✅
	'kiss', // ✅
	'laugh', // ✅
	'lurk', // ✅
	'nod', // ✅
	'nom', // ✅
	'nope', // ✅
	'pat', // ✅
	'peck', // ✅
	'poke', // ✅
	'pout', // ✅
	'punch', // ✅
	'shoot', // ✅
	'shrug', // ✅
	'slap', // ✅
	'sleep', // ✅
	'smile', // ✅
	'smug', // ✅
	'stare', // ✅
	'think', // ✅
	'thumbsup', // ✅
	'tickle', // ✅
	'wave', // ✅
	'wink', // ✅
	'yawn', // ✅
	'yeet', // ✅
] as const;

export const IMAGE_CATEGORIES = {
	img: IMAGE_CATEGORY,
	gif: GIF_CATEGORY,
} as const;

export type ImageCategories = typeof IMAGE_CATEGORIES;

export interface ImageRes {
	artist_href?: string;
	artist_name?: string;
	source_url?: string;
	anime_name?: string;
	url: string;
}
