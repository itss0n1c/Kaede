import { fun } from '@kaede/apis';
import { Command, inlineCode } from '@kaede/utils';
import type { Kaede } from '../../index.js';

export default new Command<Kaede>({
	name: 'roll',
	description: 'roll a dice',
}).addHandler('chatInput', (bot, int) => {
	return int.reply({
		content: `## 🎲 You rolled a ${inlineCode(fun.roll().toLocaleString())}`,
	});
});
