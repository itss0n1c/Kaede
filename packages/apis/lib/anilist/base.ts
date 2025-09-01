import { md5 } from '@kaede/utils';
import { Stash } from '@warsam-e/stash';
import { AniQLClient, type AniQLRequestOptions, type FieldsSelection, type Query, type QueryGenqlSelection } from 'aniql';

const client_id = 29912;
const client = new AniQLClient({ auth: { response_type: 'token', client_id } });

const cache = new Stash('anilist');

export const make_query = client.make_query.bind(client);

export async function query<R extends QueryGenqlSelection>(
	request: R & {
		__name?: string;
	},
	opts?: AniQLRequestOptions,
): Promise<FieldsSelection<Query, R>> {
	const key = md5(JSON.stringify(request));
	return cache.wrap(key, '1 hour later', () => client.query(request, opts));
}
