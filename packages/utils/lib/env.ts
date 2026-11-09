import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import arkenv from '@arkenv/core';
import { config } from 'dotenv';

export const proj_root = join(import.meta.path, '../../../..');
export const dbs_root = join(proj_root, 'dbs');

await mkdir(dbs_root, { recursive: true });

if (Bun.env.NODE_ENV !== 'production') {
	config({
		path: join(proj_root, '.env'),
		quiet: true,
	});
}

export const env = arkenv({
	NODE_ENV: "'development' | 'production' | 'test' = 'development'",
	DISCORD_TOKEN: 'string',
	DISCORD_CLIENT_ID: 'string',
	DISCORD_CLIENT_SECRET: 'string',
	WH_API_KEY: 'string',
	SAUCENAO_API_KEY: 'string',
});

export const IS_PROD = env.NODE_ENV === 'production';
