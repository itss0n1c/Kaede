import { Command, inlineCode } from '@kaede/utils';
import type { Kaede } from '../../index.js';

export default new Command<Kaede>({
	name: 'roll',
	description: 'roll a dice',
}).addHandler('chatInput', (bot, int) => {
	const roll = Math.floor(Math.random() * 6) + 1;
	return int.reply({
		content: `## 🎲 You rolled a ${inlineCode(roll.toLocaleString())}`,
	});
});
