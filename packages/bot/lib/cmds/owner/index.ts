import { Command } from '@kaede/utils';
import type { Kaede } from '../../bot.js';
import evalc from './evalc.js';

export default new Command<Kaede>({
	name: 'owner',
	description: 'owner commands',
	owners_only: true,
}).addSubCommands([evalc]);
