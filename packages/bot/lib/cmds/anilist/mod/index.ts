import { Command } from '@kaede/utils';
import type { Kaede } from '../../..';
import character from './character';

export default new Command<Kaede>({
	name: 'anilist',
	description: 'Anilist commands',
}).addSubCommands([character]);
