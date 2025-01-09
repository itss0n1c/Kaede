import { Command } from '@kaede/utils';
import type { Kaede } from '../../bot';
import { saucenao, saucenao_contexts } from './saucenao';
import trace, { lookup_anime_contexts } from './trace';
import zerochan from './zerochan';

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
