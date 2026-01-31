import { fun } from '@kaede/apis';
import { Command, capitalize } from '@kaede/utils';
import type { Kaede } from '../../bot.ts';

export default new Command<Kaede>({
	name: 'flip',
	description: 'Flip a coin',
}).addHandler('chat_input', (_bot, int) => int.reply(`## 🪙 ${capitalize(fun.flip())}!`));
