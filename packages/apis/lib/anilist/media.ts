import type { MediaGenqlSelection, MediaTagGenqlSelection, MediaType, StaffGenqlSelection } from 'aniql';
import { query } from './base';
import { _clean_top, fuzzy_date } from './misc';

const staff_selection = {
	id: true,
	name: { userPreferred: true },
	languageV2: true,
	siteUrl: true,
	image: { large: true },
} satisfies StaffGenqlSelection;

const tags_selection = {
	name: true,
	isAdult: true,
	rank: true,
} satisfies MediaTagGenqlSelection;

export const media_selection = {
	id: true,
	idMal: true,
	title: { __scalar: true },
	coverImage: { __scalar: true },
	bannerImage: true,
	description: true,
	genres: true,
	staff: {
		pageInfo: { total: true },
		edges: {
			id: true,
			role: true,
			node: staff_selection,
		},
	},
	averageScore: true,
	status: true,
	format: true,
	episodes: true,
	chapters: true,
	startDate: fuzzy_date,
	endDate: fuzzy_date,
	isAdult: true,
	tags: tags_selection,
	siteUrl: true,
} satisfies MediaGenqlSelection;

export const media_search = (term: string, type: MediaType) =>
	query({
		Page: {
			__args: { page: 1, perPage: 25 },
			media: {
				__args: { search: term, type, isAdult: false },
				...media_selection,
			},
		},
	}).then((r) => _clean_top(r.Page?.media ?? []));

export const media_get = (id: number, type: MediaType) =>
	query({ Media: { __args: { id, type }, ...media_selection } }).then((r) => r.Media);

export const media_bulk = (ids: Array<number>, type: MediaType) =>
	query({
		Page: {
			__args: { page: 1, perPage: ids.length },
			media: {
				__args: { id_in: ids, isAdult: false, type },
				...media_selection,
			},
		},
	}).then((r) => _clean_top(r.Page?.media ?? []));

export const media_trending = (type: MediaType) =>
	query({
		Page: {
			__args: { page: 1, perPage: 25 },
			media: {
				__args: { sort: ['TRENDING_DESC'], isAdult: false, type },
				...media_selection,
			},
		},
	}).then((r) => _clean_top(r.Page?.media ?? []));

export type AnilistMedia = NonNullable<Awaited<ReturnType<typeof media_get>>>;

export const author_get = (staff: AnilistMedia['staff']) =>
	staff?.edges?.find((e) => ['Original Creator', 'Story & Art', 'Original Story'].includes(e?.role ?? ''))?.node;
