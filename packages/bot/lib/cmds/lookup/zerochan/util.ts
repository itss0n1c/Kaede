import type { lookup } from '@kaede/apis';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	create_scrollable,
	EmbedBuilder,
	filesize,
	inline_code,
	is_url,
	type Message,
	type RepliableInteraction,
	type ScrollableContent,
	SeparatorSpacingSize,
	stream_to_attachment,
	TextDisplayBuilder,
	try_prom,
} from '@kaede/utils';
import type { Kaede } from '../../../bot.ts';

export async function partial_scroll(
	bot: Kaede,
	res: () => Promise<lookup.zerochan.ZeroPartialEntry[]>,
	int: RepliableInteraction,
) {
	return create_scrollable({
		int,
		data: res,
		show_page_count: true,
		fail_msg: bot.error_msg('Nothing was found...'),
		match: partial_entry_to_embed(bot),
	});
}

const large_img_link = (id: number, name: string) =>
	`https://s1.zerochan.net/${encodeURIComponent(name)}.600.${id}.jpg`;

function partial_entry_to_embed(bot: Kaede) {
	return async (entry: lookup.zerochan.ZeroPartialEntry): Promise<ScrollableContent> => {
		const file = await try_prom(stream_to_attachment(large_img_link(entry.id, entry.tag), 'thumbnail.png'));
		if (!file) return bot.error_msg("I wasn't able to get the image...");

		const container = new ContainerBuilder()
			.addTextDisplayComponents([
				new TextDisplayBuilder().setContent(`## ${entry.tag}`),
				new TextDisplayBuilder().setContent(`Dimensions: ${entry.width} x ${entry.height}`),
				new TextDisplayBuilder().setContent(`Tags: ${entry.tags.map((t) => inline_code(t)).join(', ')}`),
			])
			.addMediaGalleryComponents((m) => m.addItems((i) => i.setURL('attachment://thumbnail.png')))
			.addSeparatorComponents((i) => i.setDivider(true).setSpacing(SeparatorSpacingSize.Large))
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Entry ID: ${entry.id}`))
			.addActionRowComponents((a) =>
				a.setComponents([
					...(is_url(entry.source)
						? [new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Source').setURL(entry.source)]
						: [
								new ButtonBuilder()
									.setStyle(ButtonStyle.Secondary)
									.setLabel('Unknown Source')
									.setDisabled(true)
									.setCustomId('unknown_source'),
							]),
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('View on Zerochan')
						.setURL(`https://www.zerochan.net/${entry.id}`),
				]),
			);

		return { files: [file], components: [container] };
	};
}

export async function send_entry(
	bot: Kaede,
	int: RepliableInteraction,
	entry: lookup.zerochan.ZeroEntry,
): Promise<Message> {
	const size = filesize(entry.size);
	const img = large_img_link(entry.id, entry.primary);
	if (!img) return int.editReply(bot.error_msg('Thats weird, theres no images available for this post...'));
	const file = await try_prom(stream_to_attachment(img, 'image.png'));
	if (!file) return int.editReply(bot.error_msg("I wasn't able to get the image..."));

	const embed = new EmbedBuilder()
		.setTitle(entry.primary)
		.setImage('attachment://image.png')
		.setFields([
			{
				name: 'Dimensions',
				value: `${entry.width} x ${entry.height}`,
				inline: true,
			},
			{
				name: 'Size',
				value: size.toLocaleString(),
				inline: true,
			},
			{
				name: 'Hash',
				value: entry.hash,
				inline: true,
			},
			{
				name: 'Tags',
				value: `-# ${entry.tags.map((t) => inline_code(t)).join(', ')}`,
			},
		])
		.setFooter({
			text: `Entry ID: ${entry.id}`,
		});

	const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
		new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Source').setURL(entry.source),
		new ButtonBuilder()
			.setStyle(ButtonStyle.Link)
			.setLabel('View on Zerochan')
			.setURL(`https://www.zerochan.net/${entry.id}`),
	]);

	return int.editReply({ content: '', embeds: [embed], files: [file], components: [row] });
}
