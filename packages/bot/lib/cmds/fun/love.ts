import { fun } from '@kaede/apis';
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
	const love = fun.love.get(user.displayName, user2.displayName);
	const hearts = fun.love.hearts(love);
	return int.reply({
		content: [`### ❤️ ${user} and ${user2} ❤️`, `### ${Math.floor(love)}%: ${hearts}`].join('\n'),
	});
});
