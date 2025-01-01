import { Command, inlineCode } from '@kaede/utils';
import type { Kaede } from '../index.js';

export default new Command<Kaede>({
	name: 'ping',
	description: 'Pong!',
}).addHandler('chatInput', async (bot, int) => {
	const date = Date.now();
	await int.reply(bot.thinking);
	const diff = Date.now() - date;

	await int.editReply({
		content: [
			'### :ping_pong: Pong!',
			`**Latency:** ${inlineCode(`${diff}ms`)}`,
			`**API Latency:** ${inlineCode(`${Math.round(bot.ws.ping)}ms`)}`,
		].join('\n'),
	});
});
