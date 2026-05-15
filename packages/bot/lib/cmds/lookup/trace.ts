import { lookup } from '@kaede/apis';
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	AttachmentBuilder,
	type BaseInteraction,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	Command,
	ContainerBuilder,
	create_scrollable,
	fetch,
	fileType,
	type MessageContextMenuCommandInteraction,
	type RepliableInteraction,
	SeparatorSpacingSize,
	try_prom,
	type UserContextMenuCommandInteraction,
} from '@kaede/utils';
import type { Kaede } from '../../bot.ts';
import { get_msg_attachment_url, get_pfp_context } from './util.ts';

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
			const site_url = val.media.siteUrl ?? `https://anilist.co/anime/${val.anilist_id}`;

			console.log(val);

			const res = await try_prom(fetch(val.video));
			const blob = await try_prom(res?.blob());
			if (!blob) throw new Error('Failed to fetch video preview');

			const blob_type = blob ? await fileType.fileTypeFromBlob(blob) : null;
			const filename = `${val.id}.${blob_type?.ext ?? 'mp4'}`;
			const buf = Buffer.from(await blob.arrayBuffer());
			const file = new AttachmentBuilder(buf, { name: filename });
			files.push(file);

			const content = [
				`## ${name}`,
				`**Episode**: ${val.episode ?? 'Unknown'}`,
				`**Time**: ${seconds_to_minutes(val.from)} - ${seconds_to_minutes(val.to)}`,
				`**Similarity**: ${(val.similarity * 100).toFixed(2)}%`,
			].join('\n');

			const container = new ContainerBuilder()
				.addMediaGalleryComponents((x) => x.addItems((i) => i.setURL(`attachment://${file.name}`)))
				.addSeparatorComponents((x) => x.setDivider(true).setSpacing(SeparatorSpacingSize.Large))
				.addTextDisplayComponents((x) => x.setContent(content))
				.addSeparatorComponents((x) => x.setDivider(true).setSpacing(SeparatorSpacingSize.Large))
				.addActionRowComponents((x) =>
					x.addComponents(
						new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(site_url).setLabel('View on AniList'),
					),
				);

			return {
				// content,
				components: [container],
				files,
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
		name: 'Search Anime Image / GIF',
		type: ApplicationCommandType.Message,
	}).addHandler('message_context_menu', handle_image('message_context_menu')),
];
