import { Command } from '@kaede/utils';
import type { Kaede } from '../..';
import eight_ball from './8ball';
import flip from './flip';
import roll from './roll';

export default new Command<Kaede>({
	name: 'fun',
	description: 'Fun commands',
}).addSubCommands([roll, eight_ball, flip]);
