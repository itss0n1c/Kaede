import { lookup } from '@kaede/apis';
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	Command,
	create_scrollable,
	get_buf,
	md5,
	type MessageContextMenuCommandInteraction,
	type RepliableInteraction,
	type ScrollableContent,
	to_png,
	try_prom,
	type UserContextMenuCommandInteraction
} from '@kaede/utils';
import type { Kaede } from '../../bot';
import { get_msg_attachment_url, get_pfp_context } from './util';

interface HandleTypes {
	chat_input: ChatInputCommandInteraction;
	user_context_menu: UserContextMenuCommandInteraction;
	message_context_menu: MessageContextMenuCommandInteraction;
}

function author_button(sauce: lookup.saucenao.SauceResItem) {
	const button = new ButtonBuilder().setLabel(sauce.authorName ? `By ${sauce.authorName}` : 'Unknown Author');
	if (sauce.authorUrl) button.setStyle(ButtonStyle.Link).setURL(sauce.authorUrl);
	else button.setStyle(ButtonStyle.Secondary).setCustomId('_saucenao_author').setDisabled(true);

	return button;
}

async function match_sauce(sauce: lookup.saucenao.SauceResItem): Promise<ScrollableContent> {
	console.log(sauce);
	const url = new URL(sauce.thumbnail);

	const fileame = `${md5(sauce.url)}.png`;
	const files: AttachmentBuilder[] = [];
	const buf = await try_prom(get_buf(sauce.thumbnail));
	if (buf) {
		const png = await try_prom(to_png(buf));
		if (png) files.push(new AttachmentBuilder(png, { name: fileame }));
	}

	const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
		new ButtonBuilder()
			.setStyle(ButtonStyle.Secondary)
			.setLabel(`${sauce.similarity}%`)
			.setDisabled(true)
			.setCustomId('_saucenao_similarities'),
		author_button(sauce),
		new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(`Source (${sauce.site})`).setURL(sauce.url),
	]);

	return {
		content: !files.length ? '-# Failed to load image from source...' : '',
		files,
		embed: undefined,
		components: [row],
	};
}

const handle_sauce = (url: string, bot: Kaede, int: RepliableInteraction) =>
	create_scrollable({
		int,
		data: () => lookup.saucenao.lookup(url),
		fail_msg: { content: 'Failed to find the source of the image.' },
		show_page_count: true,
		match: match_sauce,
	});

async function handle_chat(bot: Kaede, int: RepliableInteraction) {
	if (!int.isChatInputCommand()) return int.editReply('This command can only be used in chat.');
	const attachment = int.options.getAttachment('image', true);
	return handle_sauce(attachment.url, bot, int);
}
async function handle_user(bot: Kaede, int: RepliableInteraction) {
	if (!int.isUserContextMenuCommand()) return int.editReply('This command can only be used in context menus.');
	const avatar = await try_prom(get_pfp_context(int));
	if (!avatar) return int.editReply("Failed to get the user's avatar.");
	return handle_sauce(avatar, bot, int);
}
async function handle_message(bot: Kaede, int: RepliableInteraction) {
	if (!int.isMessageContextMenuCommand()) return int.editReply('This command can only be used in context menus.');
	const url = await try_prom(get_msg_attachment_url(int));
	if (!url) return int.editReply('Failed to get the image from the message.');
	return handle_sauce(url, bot, int);
}

function handle_image<Type extends keyof HandleTypes>(type: Type) {
	return async (bot: Kaede, int: HandleTypes[Type]) => {
		await int.reply(bot.thinking);
		if (type === 'chat_input') return handle_chat(bot, int);
		if (type === 'user_context_menu') return handle_user(bot, int);
		if (type === 'message_context_menu') return handle_message(bot, int);
	};
}

export const saucenao = new Command<Kaede>({
	name: 'saucenao',
	description: 'Find the source of an anime image.',
	options: [
		{
			name: 'image',
			description: 'The image to find the source of.',
			type: ApplicationCommandOptionType.Attachment,
			required: true,
		},
	],
}).addHandler('chat_input', handle_image('chat_input'));

export const saucenao_contexts = [
	new Command<Kaede>({
		name: 'Get the Sauce',
		type: ApplicationCommandType.Message,
	}).addHandler('message_context_menu', handle_image('message_context_menu')),
	new Command<Kaede>({
		name: 'Get the Sauce - User',
		type: ApplicationCommandType.User,
	}).addHandler('user_context_menu', handle_image('user_context_menu')),
];
