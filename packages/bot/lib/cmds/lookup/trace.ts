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
	type Message,
	type MessageContextMenuCommandInteraction,
	type RepliableInteraction,
	type UserContextMenuCommandInteraction,
	create_scroll_embed,
	extname,
	stream_to_attachment,
	try_prom,
} from '@kaede/utils';

import { trace } from '@kaede/apis';
import type { Kaede } from '../../index.js';

interface HandleTypes {
	chatInput: ChatInputCommandInteraction;
	userContextMenu: UserContextMenuCommandInteraction;
	messageContextMenu: MessageContextMenuCommandInteraction;
}

function seconds_to_minutes(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

async function handle_res(bot: Kaede, res: trace.TraceRes, int: RepliableInteraction) {
	await create_scroll_embed({
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
		const res = await trace.lookup(url);
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
	const _member = int.targetId;
	if (!int.guild) {
		throw new Error('No guild found');
	}
	const member = await int.guild.members.fetch(_member);
	const avatar = member.displayAvatarURL();
	return handle_trace(avatar, bot, int);
}

async function attachment_finder(message: Message): Promise<string> {
	if (message.attachments.size === 0) {
		throw new Error('No attachments found');
	}
	const attachment = message.attachments.first();
	if (!attachment) {
		throw new Error('No attachment found');
	}
	return attachment.url;
}

async function embed_finder(message: Message): Promise<string> {
	if (message.embeds.length === 0) {
		throw new Error('No embeds found');
	}
	const embed = message.embeds[0];
	if (embed.video) {
		return embed.video.url;
	}
	throw new Error('No video found');
}

async function handle_message(bot: Kaede, int: MessageContextMenuCommandInteraction) {
	const settled = await Promise.allSettled([attachment_finder(int.targetMessage), embed_finder(int.targetMessage)]);
	const found = settled.find((s) => s.status === 'fulfilled') as PromiseFulfilledResult<string>;
	if (!found) {
		throw new Error('No attachments or embeds found');
	}
	const url = found.value;
	return handle_trace(url, bot, int);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function handle_image<Type extends keyof HandleTypes>(type: Type): (bot: Kaede, int: HandleTypes[Type]) => any {
	return async (bot, int) => {
		await int.reply(bot.thinking);
		switch (type) {
			case 'chatInput':
				return handle_chat(bot, int as ChatInputCommandInteraction);
			case 'userContextMenu':
				return handle_user(bot, int as UserContextMenuCommandInteraction);
			case 'messageContextMenu':
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
}).addHandler('chatInput', handle_image('chatInput'));

export const lookup_anime_contexts = [
	new Command<Kaede>({
		name: 'Search Anime',
		type: ApplicationCommandType.User,
	}).addHandler('userContextMenu', handle_image('userContextMenu')),
	new Command<Kaede>({
		name: 'Search Anime GIF',
		type: ApplicationCommandType.Message,
	}).addHandler('messageContextMenu', handle_image('messageContextMenu')),
];
