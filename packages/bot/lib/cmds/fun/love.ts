import { ApplicationCommandOptionType, Command } from '@kaede/utils';
import type { Kaede } from '../../index.js';

export default new Command<Kaede>({
	name: 'love',
	description: 'Get the love percentage between two people',
	options: [
		{
			name: 'user',
			description: 'The first person',
			required: true,
			type: ApplicationCommandOptionType.User,
		},
		{
			name: 'user2',
			description: 'The second person',
			required: false,
			type: ApplicationCommandOptionType.User,
		},
	],
}).addHandler('chatInput', async (bot, int) => {
	const user = int.options.getUser('user', true);
	const user2 = int.options.getUser('user2') ?? int.user;

	const love = Math.random() * 100;
	const loveIndex = Math.floor(love / 10);
	const loveLevel = '❤️'.repeat(loveIndex) + '♡'.repeat(10 - loveIndex);

	return int.reply({
		content: [`### ❤️ ${user} and ${user2} ❤️`, `### ${Math.floor(love)}%: ${loveLevel}`].join('\n'),
	});
});
