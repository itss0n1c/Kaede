import { Command, capitalize } from '@kaede/utils';
import type { Kaede } from '../../index.js';

export default new Command<Kaede>({
	name: 'flip',
	description: 'Flip a coin',
}).addHandler('chatInput', (bot, int) => {
	const flipped = Math.random() > 0.5 ? 'heads' : 'tails';
	return int.reply({
		content: `## 🪙 ${capitalize(flipped)}!`,
	});
});
