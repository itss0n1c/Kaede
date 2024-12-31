import { Command } from '@kaede/utils';
import evalc from './evalc.js';
import { Kaede } from '../../index.js';

export default new Command<Kaede>({
	name: 'owner',
	description: 'owner commands',
	ownersOnly: true,
}).addSubCommands([evalc]);
