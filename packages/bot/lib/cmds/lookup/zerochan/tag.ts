import { lookup } from '@kaede/apis';
import { ApplicationCommandOptionType, Command, try_prom } from '@kaede/utils';
import type { Kaede } from '../../../bot';
import { partial_scroll } from './util';

export default new Command<Kaede>({
	name: 'tag',
	description: 'Browse images by tag.',
	options: [
		{
			name: 'tag',
			description: 'The tag to browse for.',
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
		{
			name: 'strict',
			description: 'Whether to browse for the exact tag.',
			type: ApplicationCommandOptionType.Boolean,
			required: false,
		},
	],
})
	.addHandler('autocomplete', async (bot, int) => {
		const tag = int.options.getString('tag', true);
		const suggestions = await try_prom(lookup.zerochan.suggestions(tag));
		console.log(suggestions);
		if (!suggestions) return int.respond([]);
		return int.respond(
			suggestions.map((s) => ({
				name: `${s.source ? `${s.source} → ` : ''}${s.type} → ${s.name}`,
				value: s.name,
			})),
		);
	})
	.addHandler('chat_input', async (bot, int) => {
		await int.reply(bot.thinking);

		const tag = int.options.getString('tag', true);
		const strict = int.options.getBoolean('strict', false) ?? false;

		await partial_scroll(bot, () => lookup.zerochan.tag_info(tag, strict), int);
	});
