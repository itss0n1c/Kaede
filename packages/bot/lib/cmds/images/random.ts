import { images } from '@kaede/apis';
import {
    ActionRowBuilder,
    AttachmentBuilder,
    basename,
    ButtonBuilder,
    ButtonStyle,
    Command,
    get_stream_node,
    try_prom,
} from '@kaede/utils';
import type { Kaede } from '../..';

export default new Command<Kaede>({
	name: 'random',
	description: 'Get a random pic',
}).addHandler('chat_input', async (bot, int) => {
	await int.reply(bot.thinking);
	const res = await try_prom(images.random.get());
	if (!res) return int.editReply({ content: 'Not found' });

	console.log(res);

	const url = `https://${res.file_url}`;

	const file = await try_prom(
		get_stream_node(url).then((b) => new AttachmentBuilder(b, { name: basename(res.file_url) })),
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

	return int.editReply({
		content: '',
		files: [file],
		components,
	});
});
