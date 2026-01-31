import { Command, get_default_cmds } from '@kaede/utils';
import type { Kaede } from '../../bot.ts';

const { eval: evalc } = get_default_cmds<Kaede>();

export default new Command<Kaede>({
	name: 'owner',
	description: 'Owner-only commands',
	owners_only: true,
}).addSubCommands([evalc]);
