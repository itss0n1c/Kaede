export interface ZeroSearchQuery {
	/** page number */
	p: number;
	/** limit */
	l?: number;
	/** sorting order */
	s?: 'id' | 'fav';
	/** Time used for sorting by popularity. 0 indicates all time, 1 indicates the last 7000 entries, 2 indicates the last 15000 entries. This parameters' behavior might be changed soon. */
	t?: 0 | 1 | 2;
	d?: 'large' | 'huge' | 'landscape' | 'portrait' | 'square';
	c?: 'red' | 'blue' | 'green';
}

export interface ZeroPartialEntry {
	id: number;
	width: number;
	height: number;
	thumbnail: string;
	source: string;
	tag: string;
	tags: string[];
}

export interface ZeroEntryList {
	items?: ZeroPartialEntry[];
}

export interface ZeroEntry extends Omit<ZeroPartialEntry, 'thumbnail' | 'tag'> {
	small?: string;
	medium?: string;
	large?: string;
	full?: string;
	size: number;
	hash: string;
	primary: string;
}
