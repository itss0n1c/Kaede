import { fun } from '@kaede/apis';
import { ApplicationCommandOptionType, Command, EmbedBuilder, inlineCode } from '@kaede/utils';
import type { Kaede } from '../../bot.js';

export default new Command<Kaede>({
	name: '8ball',
	description: 'ask the magic 8ball',
	options: [
		{
			name: 'question',
			description: 'the question',
			required: true,
			type: ApplicationCommandOptionType.String,
		},
	],
}).addHandler('chat_input', (_bot, int) => {
	const q = int.options.getString('question', true);
	const { question, answer, color } = fun.eight_ball.get(q);
	const embed = new EmbedBuilder()
		.setDescription([`### ${int.user} asked: \`${inlineCode(question)}\``, `## 🎱 → ${answer}`].join('\n'))
		.setColor(color);
	return int.reply({
		embeds: [embed],
		allowedMentions: { repliedUser: false },
	});
});
