import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	Command,
	EmbedBuilder,
	type ImageExtension,
	InteractionContextType,
	TimestampStyles,
	bytesToSize,
	get_buf,
	get_image_color,
	inlineCode,
	time_str,
	try_prom,
} from '@kaede/utils';
import { cpu } from 'node-os-utils';
import { totalmem } from 'node:os';
import type { Kaede } from '../index.js';

export default new Command<Kaede>({
	name: 'info',
	description: 'Information about Kaede',
	integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
}).addHandler('chatInput', async (bot, int) => {
	await int.deferReply();

	const time_since = process.uptime() * 1000;
	const uptime = time_str(Date.now() - time_since, TimestampStyles.RelativeTime);

	console.log(totalmem());
	const memory_usage = `${bytesToSize(process.memoryUsage().heapUsed)}`;

	const cpu_usage_percent = await cpu.usage();
	const cpu_usage = `${cpu_usage_percent.toFixed(2)}%`;

	const users_count = bot.application?.approximateUserInstallCount?.toLocaleString() ?? 'N/A';
	const cmds_count = bot.commands.reduce((a, b) => a + b.subcommands.length, 0).toLocaleString();

	const bun_version = process.versions.bun ?? 'N/A';
	const node_version = process.versions.node ?? 'N/A';
	const webkit_version = process.versions.webkit ?? 'N/A';

	const embed = new EmbedBuilder()
		.setDescription(
			[
				`### ${bot.name}`,
				`About **${users_count} users** have me installed.`,
				`**${cmds_count} commands** available.`,

				'### Server Info',
				`**Uptime:** ${uptime}`,
				`**Memory:** ${inlineCode(memory_usage)}`,
				`**CPU:** ${inlineCode(cpu_usage)}`,
				'',
				`**Uses [Meinu ^${bot.meinu_version}](https://github.com/itss0n1c/meinu), on the [Bun runtime](https://bun.sh).**`,
			].join('\n'),
		)
		.setFooter({
			text: `Bun: ${bun_version} | Node API: ${node_version} | WebKit: ${webkit_version}`,
		})
		.setColor(bot.bot_color);

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

	return int.editReply({ embeds: [embed], files, components: [row] });
});
