import { fun } from '@kaede/apis';
import { Command, capitalize } from '@kaede/utils';
import type { Kaede } from '../../bot.js';

export default new Command<Kaede>({
	name: 'flip',
	description: 'Flip a coin',
}).addHandler('chat_input', (bot, int) => {
	return int.reply({
		content: `## 🪙 ${capitalize(fun.flip())}!`,
	});
});
