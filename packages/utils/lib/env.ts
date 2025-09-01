import { config } from 'dotenv';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const IS_PROD = get_env('NODE_ENV') === 'production';
export const proj_root = join(import.meta.url.replace('file://', ''), '../../../..');
export const dbs_root = join(proj_root, 'dbs');

await mkdir(dbs_root, { recursive: true });

if (!IS_PROD) {
	config({
		path: join(proj_root, '.env'),
		quiet: true,
	});
}

type BotEnv = 'DISCORD_TOKEN' | 'DISCORD_CLIENT_ID' | 'DISCORD_CLIENT_SECRET';
type WHEnv = 'WH_API_KEY';
type SNEnv = 'SAUCENAO_API_KEY';
type APIEnv = 'API_PORT';
type Env = 'NODE_ENV' | BotEnv | WHEnv | SNEnv | APIEnv;

export function get_env<
	T extends 'string' | 'boolean' | 'number' = 'string',
	V = T extends 'string' ? string : T extends 'boolean' ? boolean : number,
>(env: Env, type?: T): V {
	const current_type = type ?? ('string' as T);
	const val = process.env[env];
	if (!val) {
		if (env === 'NODE_ENV') return 'development' as V;
		throw new Error(`Environment variable ${env} is not set`);
	}
	if (current_type === 'string') return val as V;
	if (current_type === 'boolean') return (val === 'true') as V;
	const num = Number(val);
	if (Number.isNaN(num)) {
		throw new Error(`Environment variable ${env} is not a number`);
	}
	return num as V;
}
