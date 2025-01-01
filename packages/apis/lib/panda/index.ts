import { api_request_client } from '@kaede/utils';

const request = api_request_client('https://panda.spoo.me');

type PandaRes<Prop extends string> = { [key in Prop]: Array<string> };

const [facts, pics, gifs] = await Promise.all([
	request<PandaRes<'facts'>>({ path: '/all-facts' }),
	request<PandaRes<'pics'>>({ path: '/all-pics' }),
	request<PandaRes<'gifs'>>({ path: '/all-gifs' }),
]);

const random = (arr: Array<string>) => arr[Math.floor(Math.random() * arr.length)];

export const fact = () => random(facts.facts);
export const pic = () => random(pics.pics);
export const gif = () => random(gifs.gifs);
