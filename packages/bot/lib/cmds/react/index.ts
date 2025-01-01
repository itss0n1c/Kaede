import { images } from '@kaede/apis';
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	AttachmentBuilder,
	basename,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	Command,
	get_stream_node,
	is_url,
	try_prom,
} from '@kaede/utils';
import type { Kaede } from '../../index.js';
import { multi_user, single_user } from './reactions/index.js';
import type { AnyCategory, Category, CuteResponseCB, CuteResponseData, Mentionable } from './types.js';

export async function cute_response<
	ImageType extends keyof images.nekos.ImageCategories,
	K extends images.nekos.ImageCategories[ImageType][number],
>(bot: Kaede, v: CuteResponseData<ImageType, K>, res_str?: CuteResponseCB) {
	await v.int.reply(bot.thinking);
	const res = await try_prom(images.nekos.image(v.type, v.category.category), true);
	if (!res) return v.int.editReply({ content: 'something went wrong while trying to get the image' });

	const components: ActionRowBuilder<ButtonBuilder>[] = [];

	if (res.artist_href || res.source_url || res.anime_name) {
		const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
			...(res.artist_href && is_url(res.artist_href)
				? [
						new ButtonBuilder()
							.setLabel(`By ${res.artist_name}`)
							.setStyle(ButtonStyle.Link)
							.setURL(res.artist_href),
					]
				: []),
			...(res.source_url && is_url(res.source_url)
				? [new ButtonBuilder().setLabel('View Original').setStyle(ButtonStyle.Link).setURL(res.source_url)]
				: []),
			...(res.anime_name
				? [
						new ButtonBuilder()
							.setLabel(`Anime: ${res.anime_name}`)
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true)
							.setCustomId('anime_name'),
					]
				: []),
		]);

		components.push(row);
	}

	const filename = basename(res.url);
	const file = await try_prom(get_stream_node(res.url).then((b) => new AttachmentBuilder(b, { name: filename })));
	if (!file) return v.int.editReply({ content: 'something went wrong while trying to get the image' });

	return v.int.editReply({
		content: res_str && v.category.mentioning ? `## ${res_str(v)}` : '',
		files: [file],
		components,
	});
}

async function res<K extends images.nekos.ImageCategories['gif'][number]>(
	category: Category<'gif', K>,
	bot: Kaede,
	int: ChatInputCommandInteraction,
) {
	const user = int.user;
	let user2: Mentionable | null = null;
	if (category.mentioning) {
		user2 = int.options.getMentionable('mentionable', true);
	}
	return cute_response(bot, { type: 'gif', category, int, user, user2 }, category.cb);
}

const make_cmds = (categories: Array<AnyCategory>) =>
	categories.map((v) =>
		new Command<Kaede>({
			name: v.category,
			description: v.desc ?? `${v.category} gif`,
			...(v.mentioning
				? {
						options: [
							{
								name: 'mentionable',
								description: `the mentionable (user/role) to ${v.category}`,
								type: ApplicationCommandOptionType.Mentionable,
								required: true,
							},
						],
					}
				: {}),
		}).addHandler('chatInput', async (bot, int) => res(v, bot, int)),
	);

export default new Command<Kaede>({
	name: 'react',
	description: 'reaction commands',
})
	.addSubCommandGroup({
		name: 'with',
		description: 'reaction commands with someone',
		commands: make_cmds(multi_user),
	})
	.addSubCommands(make_cmds(single_user));
