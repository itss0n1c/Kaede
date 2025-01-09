import type { Message, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from '@kaede/utils';

async function attachment_finder(message: Message): Promise<string> {
	if (message.attachments.size === 0) throw new Error('No attachments found');
	const attachment = message.attachments.first();
	if (!attachment) throw new Error('No attachment found');
	return attachment.url;
}

async function embed_finder(message: Message): Promise<string> {
	if (message.embeds.length === 0) throw new Error('No embeds found');
	const embed = message.embeds[0];
	if (!embed.video) throw new Error('No video found');
	return embed.video.url;
}

export async function get_msg_attachment_url(int: MessageContextMenuCommandInteraction) {
	const settled = await Promise.allSettled([attachment_finder(int.targetMessage), embed_finder(int.targetMessage)]);
	const found = settled.find((s) => s.status === 'fulfilled');
	if (!found) throw new Error('No attachments or embeds found');
	return found.value;
}

export async function get_pfp_context(int: UserContextMenuCommandInteraction) {
	const _member = int.targetId;
	if (!int.guild) throw new Error('This command can only be used in guilds.');
	const member = await int.guild.members.fetch(_member);
	return member.displayAvatarURL();
}
