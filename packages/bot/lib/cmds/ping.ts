import { Command, inlineCode } from '@kaede/utils';
import type { Kaede } from '../index.js';

export default new Command<Kaede>({
	name: 'ping',
	description: 'Pong!',
}).addHandler('chatInput', async (bot, int) => {
	const current = Date.now();
	const sent = await int.deferReply({
		fetchReply: true,
	});
	const diff = sent.createdTimestamp - current;
	await int.editReply({
		content: [
			'### :ping_pong: Pong!',
			`**Latency:** ${inlineCode(`${diff}ms`)}`,
			`**API Latency:** ${inlineCode(`${Math.round(bot.ws.ping)}ms`)}`,
		].join('\n'),
	});
});
