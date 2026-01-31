import { Command } from '@kaede/utils';
import type { Kaede } from '../../bot.ts';
import eight_ball from './8ball.ts';
import flip from './flip.ts';
import roll from './roll.ts';

export default new Command<Kaede>({
	name: 'fun',
	description: 'Fun commands',
}).addSubCommands([roll, eight_ball, flip]);
