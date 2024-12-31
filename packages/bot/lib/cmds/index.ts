import { ApplicationIntegrationType, InteractionContextType } from '@kaede/utils';
import cute from './cute/index.js';
import fun from './fun/index.js';
import info from './info.js';
import owner from './owner/index.js';
import ping from './ping.js';
import wallpaper from './wallpaper.js';
import weeb from './weeb/index.js';

const cmds = [owner, ping, info, wallpaper, cute, fun, ...weeb];

export default cmds.map((c) => {
	c.contexts = [InteractionContextType.BotDM, InteractionContextType.PrivateChannel, InteractionContextType.Guild];
	c.integration_types = [ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall];
	return c;
});
