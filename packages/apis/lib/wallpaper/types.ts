type AvatarSizes = '200px' | '128px' | '32px' | '20px';

interface WallpaperUploader {
	username: string;
	group: string;
	avatar: Record<AvatarSizes, string>;
}

export type WallpaperPurity = 'sfw' | 'sketchy' | 'nsfw';
export type WallpaperCategory = 'general' | 'anime' | 'people';
export type WallpaperSorting = 'date_added' | 'relevance' | 'random' | 'views' | 'favorites' | 'toplist';
type WallpaperOrdering = 'asc' | 'desc';
export type WallpaperRatio = 'allwide' | 'wide' | 'ultrawide' | 'portrait' | 'square';

type ThumbSizes = 'large' | 'original' | 'small';

interface WallpaperTag {
	id: number;
	name: string;
	alias: string;
	category_id: number;
	category: string;
	purity: WallpaperPurity;
	created_at: string;
}

export interface WallpaperInfo {
	id: string;
	url?: string;
	short_url: string;
	uploader: WallpaperUploader;
	views: number;
	favorites: number;
	source: string;
	purity: WallpaperPurity;
	category: WallpaperCategory;
	sorting: WallpaperSorting;
	order: WallpaperOrdering;
	colors: `#${string}`[];
	path: string;
	thumbs: ThumbSizes;
	tags: WallpaperTag[];
}

export interface WallpaperSearch {
	q: string;
	categories: WallpaperCategory[];
	purity: WallpaperPurity[];
	sorting: WallpaperSorting;
	order: WallpaperOrdering;
	ratios: WallpaperRatio;
	page: number;
}

export interface WallpaperSearchRes {
	id: string;
	url: string;
	short_url: string;
	views: number;
	favorites: number;
	source: string;
	purity: WallpaperPurity;
	category: WallpaperCategory;
	dimension_x: number;
	dimension_y: number;
	resolution: string;
	ratio: string;
	file_size: number;
	file_type: string;
	created_at: string;
	colors: `#${string}`[];
	path: string;
	thumbs: ThumbSizes;
}
