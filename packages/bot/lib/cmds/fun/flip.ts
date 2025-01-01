import { fun } from '@kaede/apis';
import { Command, capitalize } from '@kaede/utils';
import type { Kaede } from '../../index.js';

export default new Command<Kaede>({
	name: 'flip',
	description: 'Flip a coin',
}).addHandler('chatInput', (bot, int) => {
	return int.reply({
		content: `## 🪙 ${capitalize(fun.flip())}!`,
	});
});
