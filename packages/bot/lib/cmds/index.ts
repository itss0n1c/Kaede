import { get_default_cmds } from '@kaede/utils';
import type { Kaede } from '../bot.ts';
import anilist from './anilist/index.ts';
import fun from './fun/index.ts';
import images from './images/index.ts';

import info from './info.ts';
import lookup from './lookup/index.ts';
import owner from './owner/index.ts';
import react from './react/index.ts';

const { ping } = get_default_cmds<Kaede>();

export default [ping, info, fun, ...anilist, ...lookup, react, images, owner];
