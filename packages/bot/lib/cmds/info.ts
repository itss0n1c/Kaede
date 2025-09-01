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
import type { Kaede } from '../bot.js';

export default new Command<Kaede>({
	name: 'info',
	description: 'Information about Kaede',
}).addHandler('chat_input', async (bot, int) => {
	await int.reply(bot.thinking);

	const time_since = process.uptime() * 1000;
	const uptime = time_str(Date.now() - time_since, TimestampStyles.RelativeTime);

	console.log(totalmem());
	const memory_usage = `${bytes_to_size(process.memoryUsage().heapUsed)}`;

	const cpu_usage_percent = await cpu.usage();
	const cpu_usage = `${cpu_usage_percent.toFixed(2)}%`;

	const shard_id = bot.shardId?.toString();
	const [servers_count, members_count] = await Promise.all([bot.guildCount(), bot.memberCount()]);
	const users_count = bot.application?.approximateUserInstallCount;
	const cmds_count = bot.commands.reduce((a, b) => a + b.subcommands.length, 0);

	const bun_version = process.versions.bun ?? 'N/A';

	const embed = new EmbedBuilder()
		.setDescription(
			[
				`### ${bot.name}`,
				`I've been added to **${servers_count.toLocaleString()} ${pluralize('server', servers_count)}**,`,
				`with a total of **${members_count.toLocaleString()} ${pluralize('member', members_count)}**.`,
				`About **${users_count?.toLocaleString() ?? 'N/A'} ${pluralize('user', users_count ?? 0)}** have me installed directly.`,
				`I have **${cmds_count.toLocaleString()} ${pluralize('command', cmds_count)}** available.`,

				'### Server Info',
				`**Shard**: ${inlineCode(shard_id ? `#${shard_id}` : 'N/A')}`,
				`**Uptime:** ${uptime}`,
				`**Memory:** ${inlineCode(memory_usage)}`,
				`**CPU:** ${inlineCode(cpu_usage)}`,
				'',
				'Made with ❤️ by [war](https://warsame.me)',
				'',
				`-# Made with [Echo v${bot.echoVersion}](https://npmjs.com/package/warsam-e/echo)`,
				`-# Running on [Bun v${bun_version}](https://bun.com).`,
			].join('\n'),
		)
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
