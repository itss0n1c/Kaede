import { config } from 'dotenv';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const proj_root = join(import.meta.url.replace('file://', ''), '../../../..');
export const dbs_root = join(proj_root, 'dbs');

await mkdir(dbs_root, { recursive: true });

config({
	path: join(proj_root, '.env'),
	quiet: true,
});

type BotEnv = 'DISCORD_TOKEN' | 'DISCORD_CLIENT_ID' | 'DISCORD_CLIENT_SECRET';
type WHEnv = 'WH_API_KEY';
type SNEnv = 'SAUCENAO_API_KEY';
type KaedeEnv = BotEnv | WHEnv | SNEnv;

export function get_env<T extends 'string' | 'number' = 'string', V = T extends 'string' ? string : number>(
	env: KaedeEnv,
	type?: T,
): V {
	const current_type = type ?? ('string' as T);
	const val = process.env[env];
	if (!val) throw new Error(`Environment variable ${env} is not set`);
	if (current_type === 'string') return val as V;
	const num = Number(val);
	if (Number.isNaN(num)) throw new Error(`Environment variable ${env} is not a number`);
	return num as V;
}
