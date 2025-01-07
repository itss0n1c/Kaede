import { ApplicationIntegrationType, get_default_cmds, InteractionContextType } from '@kaede/utils';
import type { Kaede } from '../bot.js';
import anilist from './anilist/index.js';
import fun from './fun/index.js';
import images from './images/index.js';

import info from './info.js';
import lookup from './lookup/index.js';
import owner from './owner/index.js';
import react from './react/index.js';

const { ping } = get_default_cmds<Kaede>();

const cmds = [owner, ping, info, fun, ...anilist, ...lookup, react, images];

export default cmds.map((c) => {
	c.contexts = [InteractionContextType.BotDM, InteractionContextType.PrivateChannel, InteractionContextType.Guild];
	c.integration_types = [ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall];
	return c;
});
