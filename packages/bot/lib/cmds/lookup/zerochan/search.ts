import { lookup } from '@kaede/apis';
import { ApplicationCommandOptionType, Command } from '@kaede/utils';
import type { Kaede } from '../../../bot';
import { partial_scroll } from './util';

export default new Command<Kaede>({
	name: 'search',
	description: 'Searches Zerochan for images.',
	options: [
		{
			name: 'page',
			description: 'The page to search for.',
			type: ApplicationCommandOptionType.Integer,
			required: false,
		},
		{
			name: 'limit',
			description: 'The number of results to return.',
			type: ApplicationCommandOptionType.Integer,
			required: false,
			min_value: 1,
			max_value: 250,
		},
		{
			name: 'sorting',
			description: 'The sorting method to use.',
			type: ApplicationCommandOptionType.String,
			required: false,
			choices: [
				{
					name: 'Recently Uploaded',
					value: 'id',
				},
				{
					name: 'Most Popular',
					value: 'fav',
				},
			],
		},
		{
			name: 'time_for_popular',
			description: 'The time period to use for the "Most Popular" sorting method.',
			type: ApplicationCommandOptionType.Integer,
			required: false,
			choices: [
				{
					name: 'All Time',
					value: 0,
				},
				{
					name: 'Last 7000 entries',
					value: 1,
				},
				{
					name: 'Last 15000 entries',
					value: 2,
				},
			],
		},
		{
			name: 'dimensions',
			description: 'The dimensions to search for.',
			type: ApplicationCommandOptionType.String,
			required: false,
			choices: ['large', 'huge', 'landscape', 'portrait', 'square'].map((d) => ({
				name: d
					.split('')
					.map((c, i) => (i === 0 ? c.toUpperCase() : c))
					.join(''),
				value: d,
			})),
		},
		{
			name: 'color',
			description: 'The color to search for.',
			type: ApplicationCommandOptionType.String,
			required: false,
			choices: ['red', 'blue', 'green'].map((c) => ({
				name: c
					.split('')
					.map((c, i) => (i === 0 ? c.toUpperCase() : c))
					.join(''),
				value: c,
			})),
		},
	],
}).addHandler('chat_input', async (bot, int) => {
	await int.reply(bot.thinking);

	const page = int.options.getInteger('page') ?? 1;
	const limit = int.options.getInteger('limit') ?? 10;
	const sorting = (int.options.getString('sorting') ?? 'id') as lookup.zerochan.ZeroSearchQuery['s'];
	const time_for_popular = (int.options.getInteger('time_for_popular') ?? 0) as lookup.zerochan.ZeroSearchQuery['t'];
	const dimensions = int.options.getString('dimensions') as lookup.zerochan.ZeroSearchQuery['d'] | undefined;
	const color = int.options.getString('color') as lookup.zerochan.ZeroSearchQuery['c'] | undefined;

	const query: lookup.zerochan.ZeroSearchQuery = {
		p: page,
		l: limit,
		s: sorting,
		...(sorting === 'fav' ? { t: time_for_popular } : {}),
		...(dimensions ? { d: dimensions } : {}),
		...(color ? { c: color } : {}),
	};

	await partial_scroll(bot, () => lookup.zerochan.search(query), int);
});
