import { get_buf } from '@kaede/utils';
import { Elysia } from 'elysia';
import { bot } from '../bot';

const API_PORT = 3005;

export async function init_server() {
	new Elysia().use(routes).listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));
}

const routes = new Elysia().get('/', async ({ set }) => {
	const buf = await get_buf(
		bot.user?.avatarURL({ extension: bot.user.avatar?.startsWith('a_') ? 'gif' : 'png' }) ?? '',
	);
	set.headers['Content-Type'] = 'image/png';
	return buf;
});
