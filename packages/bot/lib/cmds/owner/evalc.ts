import { ApplicationCommandOptionType, AttachmentBuilder, codeBlock, Command, inlineCode } from '@kaede/utils';
import { inspect } from 'bun';
import type { Kaede } from '../../index.js';

export default new Command<Kaede>({
	name: 'eval',
	description: 'evaluate javascript',
	options: [
		{
			name: 'script',
			description: 'the code',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'as_file',
			description: 'send as file',
			type: ApplicationCommandOptionType.Boolean,
		},
	],
}).addHandler('chatInput', async (bot, int) => {
	const script = int.options.getString('script', true);
	const asFile = int.options.getBoolean('as_file') ?? false;

	await int.deferReply();

	let run: string;
	try {
		run = await Object.getPrototypeOf(async () => '').constructor('bot', 'int', `return ${script}`)(bot, int);
	} catch (e) {
		console.error(e);
		run = e as string;
	}

	if (asFile) {
		return int.editReply({
			files: [
				new AttachmentBuilder(Buffer.from(inspect(run, { depth: 5 })), {
					name: 'output.js',
				}),
			],
		});
	}

	return int.editReply({
		content: `Output for ${inlineCode(script)}:\n${codeBlock('js', inspect(run, { depth: 1 }))}`,
	});
});
