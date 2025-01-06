import { ApplicationCommandOptionType, AttachmentBuilder, codeBlock, Command, inlineCode } from '@kaede/utils';
import { inspect } from 'node:util';
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
}).addHandler('chat_input', async (bot, int) => {
	const script = int.options.getString('script', true);
	const asFile = int.options.getBoolean('as_file') ?? false;

	await int.reply(bot.thinking);

	let is_error = false;
	let run: string;
	try {
		run = await Object.getPrototypeOf(async () => '').constructor('bot', 'int', `return ${script}`)(bot, int);
	} catch (e) {
		console.error(e);
		is_error = true;
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
		content: `Output for ${inlineCode(script)}:\n${codeBlock('js', (is_error ? Bun.inspect : inspect)(run, { depth: is_error ? 0 : 1 }))}`,
	});
});
