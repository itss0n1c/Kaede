import { get_env, is_url } from '@kaede/utils';
import sagiri from 'sagiri';

const client = sagiri(get_env('SAUCENAO_API_KEY'), { results: 20 });

export type SauceResItem = Awaited<ReturnType<typeof client>>[number];

export async function lookup(link: string) {
	if (!is_url(link)) throw new Error('Invalid URL');
	return client(link);
}
