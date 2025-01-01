import { Command } from '@kaede/utils';
import type { Kaede } from '../..';
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
		.addSubCommands([trace]),
	...lookup_anime_contexts,
];
