import type { ColorResolvable } from '@kaede/utils';

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

export function get(_question: string) {
	const question = _question.endsWith('?') ? _question.slice(0, -1) : _question;
	const pick = Math.floor(Math.random() * answers.length);
	const pools = { yes, no, idk } as const;
	const pool = pools.yes.includes(answers[pick]) ? 'yes' : pools.no.includes(answers[pick]) ? 'no' : 'idk';
	const color = colors[pool];

	return {
		question,
		answer: answers[pick],
		color,
	};
}
