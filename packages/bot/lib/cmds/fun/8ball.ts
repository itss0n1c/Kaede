import { ApplicationCommandOptionType, type ColorResolvable, Command, EmbedBuilder, inlineCode } from '@kaede/utils';
import type { Kaede } from '../../index.js';

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
}).addHandler('chatInput', (bot, int) => {
	let question = int.options.getString('question', true);
	if (question.endsWith('?')) {
		question = question.slice(0, -1);
	}

	const yes = [
		'It is certain',
		'It is decidedly so',
		'Without a doubt',
		'Yes - definitely',
		'You may rely on it',
		'As I see it, yes',
		'Most likely',
		'Outlook good',
		'Yes',
		'Signs point to yes',
	];

	const idk = [
		'Reply hazy, try again',
		'Ask again later',
		'Better not tell you now',
		'Cannot predict now',
		'Concentrate and ask again',
	];

	const no = ["Don't count on it", 'My reply is no', 'My sources say no', 'Outlook not so good', 'Very doubtful'];

	const answers = [...yes, ...idk, ...no];

	const colors: Record<'yes' | 'idk' | 'no', ColorResolvable> = {
		yes: 'Green',
		idk: 'Yellow',
		no: 'Red',
	};
	const pick = Math.floor(Math.random() * answers.length);

	const pools = { yes, no, idk } as const;
	const pool = pools.yes.includes(answers[pick]) ? 'yes' : pools.no.includes(answers[pick]) ? 'no' : 'idk';

	const colorMatch = colors[pool];
	console.log({ pick, pool, colorMatch });
	const embed = new EmbedBuilder()
		.setDescription([`### ${int.user} asked: \`${inlineCode(question)}\``, `## 🎱 → ${answers[pick]}`].join('\n'))
		.setColor(colorMatch);

	return int.reply({
		embeds: [embed],
		allowedMentions: { repliedUser: false },
	});
});
