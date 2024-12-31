import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	Command,
	create_scroll_embed,
	EmbedBuilder,
} from '@kaede/utils';

import { wallpaper } from '@kaede/apis';
import type { Kaede } from '../index.js';

export default new Command<Kaede>({
	name: 'wallpaper',
	description: 'Get a wallpaper',
	options: [
		{
			name: 'query',
			description: 'The query to search for',
			type: ApplicationCommandOptionType.String,
			required: false,
		},
		{
			name: 'category',
			description: 'The category of the wallpaper',
			type: ApplicationCommandOptionType.String,
			required: false,
			choices: [
				{
					name: 'General',
					value: 'general',
				},
				{
					name: 'Anime',
					value: 'anime',
				},
				{
					name: 'People',
					value: 'people',
				},
			],
		},
		{
			name: 'sorting',
			description: 'Sorting method',
			type: ApplicationCommandOptionType.String,
			choices: [
				{
					name: 'Top List',
					value: 'toplist',
				},
				{
					name: 'Hot',
					value: 'hot',
				},
				{
					name: 'Relevance',
					value: 'relevance',
				},
				{
					name: 'Random',
					value: 'random',
				},
				{
					name: 'Views',
					value: 'views',
				},
				{
					name: 'Date Added',
					value: 'date_added',
				},
				{
					name: 'Favorites',
					value: 'favorites',
				},
			],
		},
		// {
		// 	name: 'purity',
		// 	description: 'Purity of the wallpaper',
		// 	type: ApplicationCommandOptionType.String,

		// 	choices: [
		// 		{
		// 			name: 'sfw',
		// 			value: 'sfw',
		// 		},
		// 		{
		// 			name: 'sketchy',
		// 			value: 'sketchy',
		// 		},
		// 		{
		// 			name: 'nsfw',
		// 			value: 'nsfw',
		// 		},
		// 	],
		// },
		{
			name: 'ratio',
			description: 'Ratio of the wallpaper',
			type: ApplicationCommandOptionType.String,
			choices: [
				{
					name: 'All Wide',
					value: 'allwide',
				},
				{
					name: 'Wide',
					value: 'wide',
				},
				{
					name: 'Ultra Wide',
					value: 'ultrawide',
				},
				{
					name: 'Portrait',
					value: 'portrait',
				},
				{
					name: 'Square',
					value: 'square',
				},
			],
		},
		{
			name: 'page',
			description: 'Change search page',
			type: ApplicationCommandOptionType.Number,
			min_value: 1,
		},
	],
})
	.hasPermission(async (bot, int) => {
		if (int.isChatInputCommand()) {
			const purity = (int.options.getString('purity') ?? 'sfw') as wallpaper.WallpaperPurity;
			const { channel } = int;
			if (!channel) {
				return true;
			}

			if (purity !== 'sfw') {
				if (channel.isTextBased() && !channel.isThread() && !channel.isVoiceBased() && !channel.isDMBased()) {
					if (!channel.nsfw) {
						return false;
					}
				}
			}
		}
		return true;
	})
	.addHandler('chatInput', async (bot, int) => {
		const query = int.options.getString('query');
		const category = int.options.getString('category') as wallpaper.WallpaperCategory | null;
		const sorting = (int.options.getString('sorting') ?? 'random') as wallpaper.WallpaperSorting | null;
		// const purity = (int.options.getString('purity') ?? 'sfw') as wallpaper.WallpaperPurity | null;
		const ratios = (int.options.getString('ratio') ?? 'allwide') as wallpaper.WallpaperRatio | null;
		const page = int.options.getNumber('page') ?? 1;
		await int.deferReply();

		const search = async () => {
			const res = await wallpaper.search_with_info({
				...(query && { q: query }),
				...(category
					? { categories: [category] }
					: {
							categories: ['general', 'anime'],
						}),
				sorting: sorting ?? undefined,
				order: 'desc',
				// ...(purity ? { purity: [purity] } : {}),
				ratios: ratios ? ratios : undefined,
				page,
			});

			if (!res.length)
				return [
					{
						uploader: {
							username: 'No_results',
							avatar: {
								'128px': 'https://example.com',
							},
						},
						short_url: 'no results',
						path: 'https://example.com',
					},
				] as wallpaper.WallpaperInfo[];
			return res;
		};

		try {
			await create_scroll_embed({
				int,
				data: search,
				match: (val, i, arr) => ({
					embed:
						val.short_url === 'no results'
							? new EmbedBuilder().setTitle('no results found').setColor('Red')
							: new EmbedBuilder()
									.setURL(val.url)
									.setImage(val.path)
									.setAuthor({
										name: val.uploader.username,
										iconURL: val.uploader.avatar['128px'],
										url: `https://wallhaven.cc/user/${val.uploader.username}`,
									})
									.setFooter({
										text: `Page ${i + 1}/${arr.length}`,
									}),
					components: [
						new ActionRowBuilder<ButtonBuilder>().setComponents([
							new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Source').setURL(val.url),
						]),
					],
				}),
			});
		} catch (e) {
			console.error(e);
			await int.editReply({
				content: e instanceof Error ? e.message : 'Failed to get a wallpaper',
			});
		}
	});
