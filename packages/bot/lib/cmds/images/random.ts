import { images } from '@kaede/apis';
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	bytes_to_size,
	Command,
	ContainerBuilder,
	get_stream_node,
	inlineCode,
	MessageFlags,
	SeparatorSpacingSize,
	try_prom,
} from '@kaede/utils';
import type { Kaede } from '../../bot.ts';

export default new Command<Kaede>({
	name: 'random',
	description: 'Get a random pic',
}).addHandler('chat_input', async (bot, int) => {
	await int.reply(bot.thinking);
	const res = await try_prom(images.random.get());
	if (!res) return int.editReply({ content: 'Not found' });

	console.log(res);

	const file = await try_prom(
		get_stream_node(res.url).then((b) => new AttachmentBuilder(b, { name: `${res.id}.png` })),
	);
	if (!file) return int.editReply({ content: 'Something went wrong while trying to get the image' });

	const components: ActionRowBuilder<ButtonBuilder>[] = [];
	if (res.source) {
		const button = new ButtonBuilder()
			.setStyle(res.source ? ButtonStyle.Link : ButtonStyle.Secondary)
			.setLabel(res.source ? 'Source' : 'Unknown Source');
		if (res.source) button.setURL(res.source);
		else button.setCustomId('disabled').setDisabled(true);
		const row = new ActionRowBuilder<ButtonBuilder>().setComponents([button]);
		components.push(row);
	}

	const container = new ContainerBuilder()
		.addMediaGalleryComponents((x) => x.addItems((i) => i.setURL(`attachment://${file.name}`)))
		.addSeparatorComponents((x) => x.setDivider(true).setSpacing(SeparatorSpacingSize.Large))
		.addTextDisplayComponents((x) =>
			x.setContent(
				[
					`Dimensions: ${inlineCode(`${res.width}x${res.height}`)}`,
					`File Size: ${inlineCode(bytes_to_size(res.size.bytes))}`,
					'',
					res.tags.map((x) => inlineCode(x)).join(', '),
				].join('\n'),
			),
		)
		.addSeparatorComponents((x) => x.setDivider(true).setSpacing(SeparatorSpacingSize.Large))
		.addActionRowComponents((x) =>
			x.addComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Secondary)
					.setCustomId('disabled')
					.setDisabled(true)
					.setLabel(`By 	${res.author}`),
				new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(res.source).setLabel('Source'),
			),
		);

	return int.editReply({
		content: '',
		components: [container],
		files: [file],
		flags: [MessageFlags.IsComponentsV2],
	});
});
