import { get_buf, get_env } from '@kaede/utils';
import { Elysia } from 'elysia';
import { bot } from '..';

const port = get_env('API_PORT', 'number');
export async function init_server() {
	new Elysia().use(routes).listen(port, () => console.log(`Listening on port ${port}`));
}

const routes = new Elysia().get('/', async ({ set }) => {
	const buf = await get_buf(
		bot.user?.avatarURL({ extension: bot.user.avatar?.startsWith('a_') ? 'gif' : 'png' }) ?? '',
	);
	set.headers['Content-Type'] = 'image/png';
	return buf;
});
