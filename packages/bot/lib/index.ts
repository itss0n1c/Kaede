import { get_env, join, MeinuSharding } from '@kaede/utils';

const current_file_path = join(import.meta.url.replace('file://', ''), '..');
await MeinuSharding.init(join(current_file_path, 'bot.ts'), get_env('DISCORD_TOKEN'));
