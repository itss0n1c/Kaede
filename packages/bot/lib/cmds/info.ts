import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	Command,
	EmbedBuilder,
	type ImageExtension,
	TimestampStyles,
	bytes_to_size,
	get_buf,
	get_image_color,
	inlineCode,
	pluralize,
	time_str,
	try_prom,
} from '@kaede/utils';
import { cpu } from 'node-os-utils';
import { totalmem } from 'node:os';
import type { Kaede } from '../index.js';

export default new Command<Kaede>({
	name: 'info',
	description: 'Information about Kaede',
}).addHandler('chatInput', async (bot, int) => {
	await int.reply(bot.thinking);

	const time_since = process.uptime() * 1000;
	const uptime = time_str(Date.now() - time_since, TimestampStyles.RelativeTime);

	console.log(totalmem());
	const memory_usage = `${bytes_to_size(process.memoryUsage().heapUsed)}`;

	const cpu_usage_percent = await cpu.usage();
	const cpu_usage = `${cpu_usage_percent.toFixed(2)}%`;

	const servers_count = bot.guilds.cache.size;
	const users_count = bot.application?.approximateUserInstallCount;
	const cmds_count = bot.commands.reduce((a, b) => a + b.subcommands.length, 0);

	const bun_version = process.versions.bun ?? 'N/A';
	const node_version = process.versions.node ?? 'N/A';
	const webkit_version = process.versions.webkit ?? 'N/A';

	const embed = new EmbedBuilder()
		.setDescription(
			[
				`### ${bot.name}`,
				`I've been added to **${servers_count.toLocaleString()} ${pluralize('server', servers_count)}**.`,
				`About **${users_count?.toLocaleString() ?? 'N/A'} ${pluralize('user', users_count ?? 0)}** have me installed.`,
				`**${cmds_count.toLocaleString()} ${pluralize('command', cmds_count)}** available.`,

				'### Server Info',
				`**Uptime:** ${uptime}`,
				`**Memory:** ${inlineCode(memory_usage)}`,
				`**CPU:** ${inlineCode(cpu_usage)}`,
				'',
				'Made with ❤️ by [S0n1c](https://s0n1c.ca)',
				'',
				`-# Made with [Meinu v${bot.meinu_version}](https://github.com/itss0n1c/meinu)`,
				'-# developed on the [Bun runtime](https://bun.sh).',
			].join('\n'),
		)
		.setFooter({
			text: `Bun: ${bun_version} | Node API: ${node_version} | WebKit: ${webkit_version}`,
		})
		.setColor(bot.color);

	const files: AttachmentBuilder[] = [];

	const ext = (bot.user?.avatar?.startsWith('a_') ? 'gif' : 'png') as ImageExtension;
	const icon_data = bot.user
		? await try_prom(get_buf(bot.user.displayAvatarURL({ size: 1024, extension: ext })))
		: null;
	if (icon_data) {
		const color = await get_image_color(icon_data, true);
		files.push(
			new AttachmentBuilder(icon_data, {
				name: `avatar.${ext}`,
			}),
		);
		embed.setThumbnail(`attachment://avatar.${ext}`).setColor(color);
	}

	const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
		new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(bot.install_link).setLabel('Install'),
	]);

	return int.editReply({ content: '', embeds: [embed], files, components: [row] });
});
