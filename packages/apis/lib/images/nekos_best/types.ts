export const IMAGE_CATEGORY = ['husbando', 'kitsune', 'neko', 'waifu'] as const;
export const GIF_CATEGORY = [
	// 'angry',
	'baka', // ✅
	'bite', // ✅
	// 'bleh',
	// 'blowkiss',
	'blush', // ✅
	// 'bonk',
	'bored', // ✅
	// 'carry',
	// 'clap',
	// 'confused',
	'cry', // ✅
	'cuddle', // ✅
	'dance', // ✅
	'facepalm', // ✅
	'feed', // ✅
	'handhold', // ✅
	'handshake', // ✅
	'happy', // ✅
	'highfive', // ✅
	'hug', // ✅
	// 'kabedon',
	'kick', // ✅
	'kiss', // ✅
	// 'lappillow',
	'laugh', // ✅
	'lurk', // ✅
	'nod', // ✅
	'nom', // ✅
	'nope', // ✅
	// 'nya',
	'pat', // ✅
	'peck', // ✅
	'poke', // ✅
	'pout', // ✅
	'punch', // ✅
	// 'run',
	// 'salute',
	// 'shake',
	'shoot', // ✅
	// 'shocked',
	'shrug', // ✅
	// 'sip',
	'slap', // ✅
	'sleep', // ✅
	'smile', // ✅
	'smug', // ✅
	// 'spin',
	'stare', // ✅
	// 'tableflip',
	// 'teehee',
	'think', // ✅
	'thumbsup', // ✅
	'tickle', // ✅
	// 'wag',
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
