import { fun } from '@kaede/apis';
import { Command, inlineCode } from '@kaede/utils';
import type { Kaede } from '../../bot.ts';

export default new Command<Kaede>({
	name: 'roll',
	description: 'roll a dice',
}).addHandler('chat_input', (_bot, int) => int.reply(`## 🎲 You rolled a ${inlineCode(fun.roll().toLocaleString())}`));
