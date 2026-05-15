import { images } from '@kaede/apis';
import {
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	bytes_to_size,
	Command,
	ContainerBuilder,
	capitalize,
	create_scrollable,
	inlineCode,
	SeparatorSpacingSize,
	stream_to_attachment,
	TimestampStyles,
	time_str,
	try_prom,
} from '@kaede/utils';
import type { Kaede } from '../../bot.ts';

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
			choices: ['general', 'anime', 'people'].map((v) => ({ name: capitalize(v), value: v })),
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
}).addHandler('chat_input', async (bot, int) => {
	const query = int.options.getString('query');
	const category = int.options.getString('category') as images.wallpaper.WallpaperCategory | null;
	const sorting = (int.options.getString('sorting') ?? 'random') as images.wallpaper.WallpaperSorting | null;
	const ratios = (int.options.getString('ratio') ?? 'allwide') as images.wallpaper.WallpaperRatio | null;
	const page = int.options.getNumber('page') ?? 1;
	await int.reply(bot.thinking);

	await create_scrollable({
		int,
		data: () =>
			images.wallpaper.search_with_info({
				...(query && { q: query }),
				...(category
					? { categories: [category] }
					: {
							categories: ['anime'],
						}),
				sorting: sorting ?? undefined,
				order: 'desc',
				ratios: ratios ? ratios : undefined,
				page,
			}),
		show_page_count: true,
		fail_msg: bot.error_msg('no wallpapers were found!'),
		match: async (val) => {
			const file = await try_prom(stream_to_attachment(val.path, 'wallpaper.png'));
			if (!file) return bot.error_msg(`i wasn't able to send the photo in this card ${bot.emotes('sad')}`);

			console.log(val);

			const container = new ContainerBuilder()
				.addMediaGalleryComponents((x) => x.addItems((i) => i.setURL(`attachment://${file.name}`)))
				.addSeparatorComponents((x) => x.setDivider(true).setSpacing(SeparatorSpacingSize.Large))
				.addTextDisplayComponents((x) =>
					x.setContent(
						[
							time_str(val.created_at, TimestampStyles.LongDate),
							`Dimensions: ${inlineCode(val.resolution)}`,
							`File Size: ${inlineCode(bytes_to_size(val.file_size))}`,
							'',
							val.tags.map((x) => inlineCode(x.name)).join(', '),
						].join('\n'),
					),
				)
				.addSeparatorComponents((x) => x.setDivider(true).setSpacing(SeparatorSpacingSize.Large))
				.addActionRowComponents((x) =>
					x.setComponents([
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel(`By ${val.uploader.username}`)
							.setURL(val.short_url),
						val.source
							? new ButtonBuilder()
									.setStyle(ButtonStyle.Link)
									.setLabel('View Original')
									.setURL(val.source)
							: new ButtonBuilder()
									.setStyle(ButtonStyle.Secondary)
									.setCustomId('unknown_source')
									.setDisabled(true)
									.setLabel('Unknown Source'),
					]),
				);

			return {
				components: [container],
				files: [file],
			};
		},
	});
});
