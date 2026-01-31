import { Command } from '@kaede/utils';
import type { Kaede } from '../../../bot.ts';
import character from './character.ts';

export default new Command<Kaede>({
	name: 'anilist',
	description: 'Anilist commands',
}).addSubCommands([character]);
