// @ts-check
import { join, proj_root } from '@kaede/utils';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://kaede.s0n1c.ca',
	outDir: join(proj_root, 'www'),
	server: {
		host: true,
	},
});
