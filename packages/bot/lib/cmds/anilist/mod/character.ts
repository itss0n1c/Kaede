import { anilist } from '@kaede/apis';
import { humanize_desc, humanize_status } from '@kaede/apis/lib/anilist';
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    Command,
    EmbedBuilder,
    get_buf,
    get_image_color,
    truncate,
    try_prom,
} from '@kaede/utils';
import type { Kaede } from '../../..';

export default new Command<Kaede>({
	name: 'character',
	description: 'Search for a character',
	options: [
		{
			name: 'character_id',
			description: 'The character to search for',
			type: ApplicationCommandOptionType.String,
			autocomplete: true,
			required: true,
		},
	],
})
	.addHandler('autocomplete', async (bot, int) => {
		const term = int.options.getString('character_id', true);
		if (!term) return int.respond([]);
		const res = await try_prom(bot.apis.anilist.characters_search(term));
		if (!res?.length) return int.respond([]);
		return int.respond(
			res.map((c) => ({
				name: `${c.name?.userPreferred ?? 'N/A'}`,
				value: c.id.toString(),
			})),
		);
	})
	.addHandler('chat_input', async (bot, int) => {
		await int.reply(bot.thinking);
		const _id = int.options.getString('character_id', true);
		const id = Number.parseInt(_id);
		if (Number.isNaN(id))
			return int.editReply({
				content:
					'Invalid ID. Make sure to use the autocomplete feature, or type the correct AniList ID manually.',
			});

		const res = await try_prom(bot.apis.anilist.characters_get(id));
		if (!res) return int.editReply({ content: 'Not found' });

		const name = res.name?.userPreferred;
		const cover = res.image?.large;
		const desc = humanize_desc(res.description);
		const age = res.age;
		const gender = res.gender;
		const blood_type = res.bloodType;
		const medias = res.media.nodes;
		const nodes = medias.flatMap((m) => anilist.get_author(m.staff));
		const author = nodes.find((n) => n !== undefined);

		const embed = new EmbedBuilder();
		if (name) embed.setTitle(name);
		if (desc) embed.setDescription(desc);
		if (author)
			embed.setAuthor({
				name: author.name?.userPreferred ?? 'Unknown',
				iconURL: author.image?.large ?? undefined,
				url: author.siteUrl ?? undefined,
			});

		embed.setFields([
			...(age ? [{ name: 'Age', value: age.toString(), inline: true }] : []),
			...(gender ? [{ name: 'Gender', value: gender.toString(), inline: true }] : []),
			...(blood_type ? [{ name: 'Blood Type', value: blood_type.toString(), inline: true }] : []),
			...(medias.length
				? [
						{
							name: 'Appears in',
							value:
								medias
									.map(
										(m) =>
											`${anilist.emoji_format(m.format)} [${truncate(m.title?.userPreferred ?? 'N/A', 30)} • ${humanize_status(m.status)}](${m.siteUrl})`,
									)
									.slice(0, 5)
									.join('\n') + (medias.length > 5 ? `\n and ${medias.length - 5} more` : ''),
						},
					]
				: []),
		]);

		const files: AttachmentBuilder[] = [];

		const site_url = res.siteUrl ?? `https://anilist.co/character/${id}`;

		const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
			new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('View More').setURL(site_url),
		]);

		if (cover) {
			const buf = await try_prom(get_buf(cover));
			if (buf) {
				files.push(new AttachmentBuilder(buf, { name: 'cover.png' }));
				embed.setThumbnail('attachment://cover.png');
				embed.setColor(await get_image_color(buf, true));
			}
		}

		return int.editReply({
			content: '',
			files,
			embeds: [embed],
			components: [row],
		});
	});
