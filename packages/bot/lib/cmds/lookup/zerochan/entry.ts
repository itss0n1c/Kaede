import type { zerochan } from '@kaede/apis';
import { ApplicationCommandOptionType, Command } from '@kaede/utils';
import type { Kaede } from '../../../bot';
import { send_entry } from './util';

export default new Command<Kaede>({
	name: 'entry',
	description: 'Get an entry',
	options: [
		{
			name: 'id',
			description: 'The ID of the specific entry.',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
	],
}).addHandler('chat_input', async (bot, int) => {
	await int.reply(bot.thinking);

	const id = int.options.getInteger('id', true);

	let res: zerochan.ZeroEntry;

	try {
		res = await bot.apis.zerochan.entry(id);
	} catch (e) {
		return int.editReply({
			content: `An error occurred while fetching the entry: ${e instanceof Error ? e.message : e}`,
		});
	}

	return send_entry(bot, int, res);
});
