import { anilist, type MediaQuery, type MediaType, type StaffQuery } from 'anilist';

export const staff_query = (n: StaffQuery) =>
	n.withId().withName('userPreferred').withLanguageV2().withSiteUrl().withImage('large');

const media_query = (m: MediaQuery) =>
	m
		.withId()
		.withMalId()
		.withTitles('userPreferred', 'english', 'native', 'romaji')
		.withStatus()
		.withFormat()
		.withSiteUrl()
		.withCoverImage('extraLarge', 'color')
		.withBannerImage()
		.withDescription(true)
		.withAverageScore()
		.withEpisodes()
		.withChapters()
		.withStartDate()
		.withEndDate()
		.isAdult()
		.withTags('name', 'isAdult', 'rank')
		.withStaff({
			pageInfo: (p) => p.withTotal(),
			edges: (e) =>
				e
					.withId()
					.withRole()
					.withNode((n) => staff_query(n)),
			nodes: (n) => staff_query(n),
		});

export async function search(term: string, type: MediaType) {
	const media_query = anilist.query
		.media()
		.withId()
		.withTitles('userPreferred', 'english', 'native', 'romaji')
		.withStatus()
		.withFormat()
		.arguments({
			search: term,
			type,
			isAdult: false,
		});
	const res = await anilist.query
		.page({
			page: 1,
			perPage: 25,
		})
		.withMedia(media_query)
		.fetch();
	return res.media;
}

export async function get(media_id: number, type: MediaType) {
	const query = media_query(anilist.query.media()).arguments({
		id: media_id,
		type,
		isAdult: false,
	});
	return query.fetch();
}

export async function bulk_get(media_ids: Array<number>, type: MediaType) {
	const _query = media_query(
		anilist.query.media().arguments({
			id_in: media_ids,
			isAdult: false,
			type,
		}),
	);

	const res = await anilist.query
		.page({
			page: 1,
			perPage: media_ids.length,
		})
		.withMedia(_query)
		.fetch();
	return res.media;
}

export type AniListMedia = Awaited<ReturnType<typeof get>>;

export const get_author = (staff: AniListMedia['staff']) =>
	staff.edges.find((e) => ['Original Creator', 'Story & Art', 'Original Story'].includes(e.role ?? ''))?.node;
