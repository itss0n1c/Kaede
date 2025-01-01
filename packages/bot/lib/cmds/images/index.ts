import type { images } from '@kaede/apis';
import {
	ActionRowBuilder,
	AttachmentBuilder,
	basename,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	Command,
	get_buf,
	is_url,
	try_prom,
} from '@kaede/utils';
import type { Kaede } from '../..';
import random from './random';

function handle_chat<K extends images.nekos.ImageCategories['img'][number]>(k: K) {
	return async (bot: Kaede, int: ChatInputCommandInteraction) => {
		await int.reply(bot.thinking);
		const img = await try_prom(bot.apis.images.nekos.image('img', k));
		if (!img) return await int.editReply('Failed to get image');
		const file = await try_prom(
			get_buf(img.url).then((b) => new AttachmentBuilder(b, { name: basename(img.url) })),
		);
		if (!file) return await int.editReply('Failed to get image');

		const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
			...(img.artist_href && is_url(img.artist_href)
				? [
						new ButtonBuilder()
							.setLabel(`By ${img.artist_name}`)
							.setStyle(ButtonStyle.Link)
							.setURL(img.artist_href),
					]
				: []),
			...(img.source_url && is_url(img.source_url)
				? [new ButtonBuilder().setLabel('View Original').setStyle(ButtonStyle.Link).setURL(img.source_url)]
				: []),
			...(img.anime_name
				? [
						new ButtonBuilder()
							.setLabel(`From ${img.anime_name}`)
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true)
							.setCustomId('anime_name'),
					]
				: []),
		]);

		await int.editReply({
			content: '',
			files: [file],
			components: [row],
		});
	};
}

const cmds = (['husbando', 'kitsune', 'neko', 'waifu'] as const).map((k) =>
	new Command<Kaede>({
		name: k,
		description: `Get a ${k} image`,
	}).addHandler('chatInput', handle_chat(k)),
);

export default new Command<Kaede>({
	name: 'images',
	description: 'image commands',
}).addSubCommands([...cmds, random]);
