import { cute } from '@kaede/apis';
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	AttachmentBuilder,
	basename,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	Command,
	get_buf,
	GuildMember,
	InteractionContextType,
	is_url,
	try_prom,
} from '@kaede/utils';
import type { Kaede } from '../../index.js';
import { create_category } from './category.js';
import type { AnyCuteResponseData, Category, CuteResponseCB, CuteResponseData } from './types.js';

function mention(v: AnyCuteResponseData) {
	const res = v.int.options.data.at(0)?.options?.at(0)?.options?.at(0);
	if (!res) return 'someone';
	if (res.role) return `<@&${res.role.id}>`;
	if (res.user) return `<@${res.user.id}>`;
	if (res.member instanceof GuildMember) return res.member;
	return 'someone';
}

export async function cute_response<
	ImageType extends keyof cute.NekoImageCategories,
	K extends cute.NekoImageCategories[ImageType][number],
>(v: CuteResponseData<ImageType, K>, res_str?: CuteResponseCB) {
	await v.int.deferReply();
	const res = await try_prom(cute.image(v.type, v.category.category), true);
	if (!res) return v.int.editReply({ content: 'something went wrong while trying to get the image' });

	const no_rows = !res.artist_href && !res.source_url && !res.anime_name;

	const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
		...(res.artist_href && is_url(res.artist_href)
			? [new ButtonBuilder().setLabel(`By ${res.artist_name}`).setStyle(ButtonStyle.Link).setURL(res.artist_href)]
			: []),
		...(res.source_url && is_url(res.source_url)
			? [new ButtonBuilder().setLabel('View Original').setStyle(ButtonStyle.Link).setURL(res.source_url)]
			: []),
		...(res.anime_name
			? [
					new ButtonBuilder()
						.setLabel(`From ${res.anime_name}`)
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true)
						.setCustomId('anime_name'),
				]
			: []),
	]);

	const file = await try_prom(get_buf(res.url), true);
	if (!file) return v.int.editReply({ content: 'something went wrong while trying to get the image' });

	const filename = basename(res.url, v.type === 'img' ? 'png' : 'gif');

	return v.int.editReply({
		content: res_str ? `## ${res_str(v)}` : null,
		files: [
			new AttachmentBuilder(file, {
				name: filename,
			}),
		],
		components: [...(!no_rows ? [row] : [])],
	});
}

const single_user = [
	create_category({
		type: 'gif',
		category: 'smile',
		desc: 'Smile',
		required: false,
		cb: (v) => `${v.user} is smiling 😊`,
	}),
	create_category({
		type: 'gif',
		category: 'wave',
		desc: 'Wave',
		required: false,
		cb: (v) => `${v.user} is waving 👋`,
	}),
	create_category({
		type: 'gif',
		category: 'stare',
		desc: 'Stare',
		required: false,
		cb: (v) => `${v.user} is staring 👀`,
	}),
	create_category({
		type: 'gif',
		category: 'shrug',
		desc: 'Shrug',
		required: false,
		cb: (v) => `${v.user} is shrugging 🤷`,
	}),
	create_category({
		type: 'gif',
		category: 'think',
		desc: 'Think',
		required: false,
		cb: (v) => `${v.user} is thinking 🤔`,
	}),
	create_category({
		type: 'gif',
		category: 'yawn',
		desc: 'Yawn',
		required: false,
		cb: (v) => `${v.user} is yawning 😴`,
	}),
	create_category({
		type: 'gif',
		category: 'laugh',
		desc: 'Laugh',
		required: false,
		cb: (v) => `${v.user} is laughing 😂`,
	}),
	create_category({
		type: 'gif',
		category: 'nod',
		desc: 'Nod',
		required: false,
		cb: (v) => `${v.user} is nodding 👍`,
	}),
	create_category({
		type: 'gif',
		category: 'nom',
		desc: 'Nom',
		required: false,
		cb: (v) => `${v.user} is omnomnoming 🍔`,
	}),
	create_category({
		type: 'gif',
		category: 'sleep',
		desc: 'Sleep',
		required: false,
		cb: (v) => `${v.user} is sleeping 😴`,
	}),
	create_category({
		type: 'gif',
		category: 'dance',
		desc: 'Dance',
		required: false,
		cb: (v) => `${v.user} is dancing 💃`,
	}),
];

const multi_user = [
	create_category({
		type: 'gif',
		category: 'kiss',
		desc: 'Kiss someone',
		cb: (v) => `${v.user} kissed ${mention(v)} 😘`,
	}),
	create_category({
		type: 'gif',
		category: 'hug',
		desc: 'Hug someone',
		cb: (v) => `${v.user} hugged ${mention(v)} 🤗`,
	}),
	create_category({
		type: 'gif',
		category: 'tickle',
		desc: 'Tickle someone',
		cb: (v) => `${v.user} tickled ${mention(v)} 😂`,
	}),
	create_category({
		type: 'gif',
		category: 'pat',
		desc: 'Pat someone',
		cb: (v) => `${v.user} patted ${mention(v)} 🥺`,
	}),
	create_category({
		type: 'gif',
		category: 'poke',
		desc: 'Poke someone',
		cb: (v) => `${v.user} poked ${mention(v)} 😬`,
	}),
	create_category({
		type: 'gif',
		category: 'bite',
		desc: 'Bite someone',
		cb: (v) => `${v.user} bit ${mention(v)} 😬`,
	}),

	create_category({
		type: 'gif',
		category: 'slap',
		desc: 'Slap someone',
		cb: (v) => `${v.user} slapped ${mention(v)} 😬`,
	}),
	create_category({
		type: 'gif',
		category: 'cuddle',
		desc: 'Cuddle with someone',
		cb: (v) => `${v.user} is cuddling with ${mention(v)} 😊`,
	}),
	create_category({
		type: 'gif',
		category: 'feed',
		desc: 'Feed someone',
		cb: (v) => `${v.user} is feeding ${mention(v)} 🥺`,
	}),
	create_category({
		type: 'gif',
		category: 'handshake',
		desc: 'Handshake',
		cb: (v) => `${v.user} is shaking hands with ${mention(v)} 🤝`,
	}),
	create_category({
		type: 'gif',
		category: 'handhold',
		desc: 'Handhold',
		cb: (v) => `${v.user} is holding hands with ${mention(v)} 🥺`,
	}),
	create_category({
		type: 'gif',
		category: 'highfive',
		desc: 'Highfive',
		cb: (v) => `${v.user} is highfiving ${mention(v)} 🖐️`,
	}),
	create_category({
		type: 'gif',
		category: 'punch',
		desc: 'Punch',
		cb: (v) => `${v.user} is punching ${mention(v)} 😬`,
	}),
	create_category({
		type: 'gif',
		category: 'shoot',
		desc: 'Shoot',
		cb: (v) => `${v.user} is shooting ${mention(v)} 🔫`,
	}),
];

const custom_categories = [...single_user, ...multi_user];

async function res<K extends cute.NekoImageCategories['gif'][number]>(
	category: Category<'gif', K>,
	bot: Kaede,
	int: ChatInputCommandInteraction,
) {
	const user2 = int.options.getMentionable('mentionable', category.required ?? true);
	return cute_response({ type: 'gif', category, int, user: int.user, user2 }, category.cb);
}

const cmds = custom_categories.map((v) =>
	new Command<Kaede>({
		name: v.category,
		description: v.desc ?? `${v.category} gif`,
		options: [
			{
				name: 'mentionable',
				description: `the mentionable (user/role) to ${v.category}`,
				required: v.required ?? true,
				type: ApplicationCommandOptionType.Mentionable,
			},
		],
	}).addHandler('chatInput', async (bot, int) => res(v, bot, int)),
);

const image_categories = (['husbando', 'kitsune', 'neko', 'waifu'] as const).map((v) =>
	create_category({ type: 'img', category: v }),
);

const imageCmds = image_categories.map((v) =>
	new Command<Kaede>({
		name: v.category,
		description: `Get a ${v.category} image`,
	}).addHandler('chatInput', async (bot, int) => cute_response({ type: 'img', category: v, int })),
);

export default new Command<Kaede>({
	name: 'cute',
	description: 'cute commands',
	integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
})
	.addSubCommandGroup({
		name: 'react',
		description: 'react commands',
		commands: cmds,
	})
	.addSubCommandGroup({
		name: 'images',
		description: 'image commands',
		commands: imageCmds,
	});
