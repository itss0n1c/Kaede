import { anilist } from 'anilist';
import { staff_query } from './media';

export async function characters_search(term: string) {
	const character_query = anilist.query.character().withId().withName('userPreferred').arguments({ search: term });

	const res = await anilist.query
		.page({
			page: 1,
			perPage: 25,
		})
		.withCharacters(character_query)
		.fetch();
	return res.characters;
}

export async function characters_get(character_id: number) {
	const query = anilist.query
		.character()
		.withId()
		.withAge()
		.withName('userPreferred')
		.withImage('large')
		.withDescription(true)
		.withGender()
		.withSiteUrl()
		.withBloodType()
		.arguments({
			id: character_id,
		})
		.withMedia({
			pageInfo: (p) => p.withTotal(),
			nodes: (n) =>
				n
					.withId()
					.withTitles('userPreferred')
					.withType()
					.withFormat()
					.withStatus()
					.withSiteUrl()
					.withStaff({
						pageInfo: (p) => p.withTotal(),
						edges: (e) =>
							e
								.withId()
								.withRole()
								.withNode((n) => staff_query(n)),
						nodes: (n) => staff_query(n),
					}),
		});
	return query.fetch();
}
