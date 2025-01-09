import { anilist } from '@kaede/apis';
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	AttachmentBuilder,
	type AutocompleteInteraction,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	Command,
	EmbedBuilder,
	get_buf,
	truncate,
	try_prom,
} from '@kaede/utils';
import type { Kaede } from '../../bot';

const media_types = ['anime', 'manga'] as const;
type MType = (typeof media_types)[number];

const handle_autocomplete = (type: MType) => async (bot: Kaede, int: AutocompleteInteraction) => {
	const term = int.options.getString(`${type}_id`, true);
	const res = await try_prom(anilist.search(term, type === 'anime' ? 'ANIME' : 'MANGA'));
	if (!res?.length) return int.respond([]);
	return int.respond(
		res.map((m) => ({
			name: [
				`${truncate(m.title?.userPreferred ?? 'N/A', 30)} [${anilist.humanize_format(m.format)}]`,
				anilist.humanize_status(m.status),
			].join(' • '),
			value: m.id.toString(),
		})),
	);
};

const handle_chat = (type: MType) => async (bot: Kaede, int: ChatInputCommandInteraction) => {
	await int.reply(bot.thinking);
	const _id = int.options.getString(`${type}_id`, true);
	const id = Number.parseInt(_id);
	if (Number.isNaN(id))
		return int.editReply({
			content: 'Invalid ID. Make sure to use the autocomplete feature, or type the correct AniList ID manually.',
		});
	const res = await try_prom(anilist.get(id, type === 'anime' ? 'ANIME' : 'MANGA'));
	if (!res) return int.editReply({ content: 'Not found' });
	const author = anilist.get_author(res.staff);
	const format = anilist.humanize_format(res.format);
	const title = res.title?.userPreferred ?? res.title?.english ?? res.title?.romaji ?? res.title?.native;
	const cover = res.coverImage?.extraLarge;
	const color = res.coverImage?.color;
	const banner = res.bannerImage;
	const desc = anilist.humanize_desc(res.description);
	const site_url = res.siteUrl ?? `https://anilist.co/${type}/${id}`;
	const mal_site_url = res.idMal ? `https://myanimelist.net/${type}/${res.idMal}` : undefined;

	const files: AttachmentBuilder[] = [];

	const embed = new EmbedBuilder();
	if (author)
		embed.setAuthor({
			name: author.name?.userPreferred ?? 'Unknown',
			iconURL: author.image?.large ?? undefined,
			url: author.siteUrl ?? undefined,
		});
	if (title) embed.setTitle(title);
	if (cover) {
		if (await try_prom(get_buf(cover).then((r) => files.push(new AttachmentBuilder(r, { name: 'cover.png' })))))
			embed.setThumbnail('attachment://cover.png');
	}
	if (banner) {
		if (await try_prom(get_buf(banner).then((r) => files.push(new AttachmentBuilder(r, { name: 'banner.png' })))))
			embed.setImage('attachment://banner.png');
	}
	if (desc) embed.setDescription(desc);
	if (color?.startsWith('#')) embed.setColor(color as `#${string}`);
	embed.setFooter({
		text: [
			format,
			`${anilist.humanize_date(res.startDate)}${res.endDate ? ` - ${anilist.humanize_date(res.endDate)}` : '?'}`,
		].join(' • '),
	});

	embed.setFields([
		...(res.status ? [{ name: 'Status', value: anilist.humanize_status(res.status), inline: true }] : []),
		...(res.episodes ? [{ name: 'Episodes', value: res.episodes.toLocaleString(), inline: true }] : []),
		...(res.chapters ? [{ name: 'Chapters', value: res.chapters.toLocaleString(), inline: true }] : []),
		...(res.averageScore
			? [{ name: 'Average Score', value: `${res.averageScore.toString()}%`, inline: true }]
			: []),
	]);

	const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
		new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('View on AniList').setURL(site_url),
		...(mal_site_url
			? [new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('View on MAL').setURL(mal_site_url)]
			: []),
	]);

	return int.editReply({
		content: '',
		files,
		embeds: [embed],
		components: [row],
	});
};

const media_cmd = (type: MType) =>
	new Command<Kaede>({
		name: type,
		description: `Get info about an ${type}`,
		options: [
			{
				name: `${type}_id`,
				description: `The ${type} to search for`,
				type: ApplicationCommandOptionType.String,
				autocomplete: true,
				required: true,
			},
		],
	})
		.addHandler('autocomplete', handle_autocomplete(type))
		.addHandler('chat_input', handle_chat(type));

export default media_types.map(media_cmd);
