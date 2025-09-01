import type { CharacterGenqlSelection } from 'aniql';
import { query } from './base';
import { media_selection } from './media';
import { _clean_top } from './misc';

const character_selection = {
	id: true,
	age: true,
	name: { userPreferred: true },
	image: { large: true },
	description: { __args: { asHtml: true } },
	gender: true,
	siteUrl: true,
	bloodType: true,
	media: {
		pageInfo: { total: true },
		nodes: media_selection,
	},
} satisfies CharacterGenqlSelection;

export const character_search = (term: string) =>
	query({
		Page: {
			__args: { page: 1, perPage: 25 },
			characters: { __args: { search: term }, id: true, name: { userPreferred: true } },
		},
	}).then((r) => _clean_top(r.Page?.characters ?? []));

export const character_get = (id: number) =>
	query({
		Character: {
			__args: { id },
			...character_selection,
		},
	}).then((r) => r.Character);

export const character_trending = () =>
	query({
		Page: {
			__args: { page: 1, perPage: 25 },
			characters: { __args: { sort: ['FAVOURITES_DESC'] }, ...character_selection },
		},
	}).then((r) => _clean_top(r.Page?.characters ?? []));

export type AnilistCharacter = NonNullable<Awaited<ReturnType<typeof character_get>>>;
