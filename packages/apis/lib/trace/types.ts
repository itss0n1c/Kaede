import type { AniListMedia } from '../anilist';

export interface TraceItem {
	id: string;
	anilist: number;
	media: AniListMedia;
	filename: string;
	episode: number;
	from: number;
	to: number;
	similarity: number;
	video: string;
	image: string;
}

export interface TraceRes {
	added_at: number;
	id: string;
	url: string;
	items: TraceItem[];
}
