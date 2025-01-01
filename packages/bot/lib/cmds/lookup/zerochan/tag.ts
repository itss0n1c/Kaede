import { zerochan } from '@kaede/apis';
import { ApplicationCommandOptionType, Command, try_prom } from '@kaede/utils';
import type { Kaede } from '../../..';
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
		if (!tag.length) return int.respond([]);
		const suggestions = await try_prom(zerochan.suggestions(tag));
		console.log(suggestions);
		if (!suggestions) return int.respond([]);
		return int.respond(
			suggestions.map((s) => ({
				name: `${s.source ? `${s.source} → ` : ''}${s.type} → ${s.name}`,
				value: s.name,
			})),
		);
	})
	.addHandler('chatInput', async (bot, int) => {
		await int.reply(bot.thinking);

		const tag = int.options.getString('tag', true);
		const strict = int.options.getBoolean('strict', false) ?? false;

		await partial_scroll(bot, () => bot.apis.zerochan.tag_info(tag, strict), int);
	});
