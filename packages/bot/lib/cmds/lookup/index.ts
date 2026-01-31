import { Command } from '@kaede/utils';
import type { Kaede } from '../../bot.ts';
import { saucenao, saucenao_contexts } from './saucenao.ts';
import trace, { lookup_anime_contexts } from './trace.ts';
import zerochan from './zerochan/index.ts';

export default [
	new Command<Kaede>({
		name: 'lookup',
		description: 'Lookup commands',
	})
		.addSubCommandGroup({
			name: 'zerochan',
			description: 'Zerochan commands',
			commands: zerochan,
		})
		.addSubCommands([trace, saucenao]),
	...lookup_anime_contexts,
	...saucenao_contexts,
];
