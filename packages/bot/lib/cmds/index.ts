import { ApplicationIntegrationType, InteractionContextType } from '@kaede/utils';
import anilist from './anilist/index.js';
import fun from './fun/index.js';
import images from './images/index.js';
import info from './info.js';
import lookup from './lookup/index.js';
import owner from './owner/index.js';
import ping from './ping.js';
import react from './react/index.js';
import wallpaper from './wallpaper.js';

const cmds = [owner, ping, info, wallpaper, fun, ...anilist, ...lookup, react, images];

export default cmds.map((c) => {
	c.contexts = [InteractionContextType.BotDM, InteractionContextType.PrivateChannel, InteractionContextType.Guild];
	c.integration_types = [ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall];
	return c;
});
