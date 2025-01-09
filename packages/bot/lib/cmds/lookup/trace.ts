import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	type AttachmentBuilder,
	type BaseInteraction,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	Command,
	type MessageContextMenuCommandInteraction,
	type RepliableInteraction,
	type UserContextMenuCommandInteraction,
	create_scrollable,
	extname,
	stream_to_attachment,
	try_prom,
} from '@kaede/utils';

import { lookup } from '@kaede/apis';
import type { Kaede } from '../../bot.js';
import { get_msg_attachment_url, get_pfp_context } from './util.js';

interface HandleTypes {
	chat_input: ChatInputCommandInteraction;
	user_context_menu: UserContextMenuCommandInteraction;
	message_context_menu: MessageContextMenuCommandInteraction;
}

function seconds_to_minutes(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

async function handle_res(bot: Kaede, res: lookup.trace.TraceRes, int: RepliableInteraction) {
	await create_scrollable({
		int,
		data: () => res.items,
		show_page_count: true,
		fail_msg: bot.error_msg('No results found'),
		match: async (val) => {
			const files: AttachmentBuilder[] = [];

			const name = val.media.title?.userPreferred ?? val.filename;
			const site_url = val.media.siteUrl ?? `https://anilist.co/anime/${val.anilist}`;

			const ext = extname(new URL(val.video).pathname);

			if (ext !== '.mp4') {
				const img_ext = extname(new URL(val.image).pathname);
				const img_filename = `${val.id}${img_ext}`;
				const img_file = await try_prom(stream_to_attachment(val.image, img_filename));
				if (img_file) files.push(img_file);
			}

			const filename = `${val.id}${ext}`;
			const file = await try_prom(stream_to_attachment(val.video, filename));
			if (file) files.push(file);

			const content = [
				`## ${name}`,
				`**Episode**: ${val.episode ?? 'Unknown'}`,
				`**Time**: ${seconds_to_minutes(val.from)} - ${seconds_to_minutes(val.to)}`,
				`**Similarity**: ${(val.similarity * 100).toFixed(2)}%`,
			].join('\n');

			return {
				content,
				files,
				components: [
					new ActionRowBuilder<ButtonBuilder>().setComponents(
						new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(site_url).setLabel('View on AniList'),
					),
				],
			};
		},
	});
}

async function handle_trace(url: string, bot: Kaede, int: BaseInteraction) {
	if (!int.isRepliable()) throw new Error('Not repliable');
	try {
		const res = await lookup.trace.lookup(url);
		return handle_res(bot, res, int);
	} catch (e) {
		console.log(e);
		await int.editReply(e instanceof Error ? e.message : 'Something went wrong.');
	}
}

async function handle_chat(bot: Kaede, int: ChatInputCommandInteraction) {
	const attachment = int.options.getAttachment('image', true);
	return handle_trace(attachment.url, bot, int);
}

async function handle_user(bot: Kaede, int: UserContextMenuCommandInteraction) {
	const avatar = await try_prom(get_pfp_context(int));
	if (!avatar) return int.editReply('No avatar found');
	return handle_trace(avatar, bot, int);
}

async function handle_message(bot: Kaede, int: MessageContextMenuCommandInteraction) {
	const url = await try_prom(get_msg_attachment_url(int));
	if (!url) return int.editReply('No attachments or embeds found');
	return handle_trace(url, bot, int);
}

function handle_image<Type extends keyof HandleTypes>(type: Type) {
	return async (bot: Kaede, int: HandleTypes[Type]) => {
		await int.reply(bot.thinking);
		switch (type) {
			case 'chat_input':
				return handle_chat(bot, int as ChatInputCommandInteraction);
			case 'user_context_menu':
				return handle_user(bot, int as UserContextMenuCommandInteraction);
			case 'message_context_menu':
				return handle_message(bot, int as MessageContextMenuCommandInteraction);
		}
	};
}

export default new Command<Kaede>({
	name: 'trace_moe',
	description: 'Search anime by image',
	options: [
		{
			name: 'image',
			description: 'Image to search',
			type: ApplicationCommandOptionType.Attachment,
			required: true,
		},
	],
}).addHandler('chat_input', handle_image('chat_input'));

export const lookup_anime_contexts = [
	new Command<Kaede>({
		name: 'Search Anime',
		type: ApplicationCommandType.User,
	}).addHandler('user_context_menu', handle_image('user_context_menu')),
	new Command<Kaede>({
		name: 'Search Anime GIF',
		type: ApplicationCommandType.Message,
	}).addHandler('message_context_menu', handle_image('message_context_menu')),
];
