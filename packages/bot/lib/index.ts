import { EchoSharding, get_env, join } from '@kaede/utils';

const current_file_path = join(import.meta.url.replace('file://', ''), '..');
await EchoSharding.init(join(current_file_path, 'bot.ts'), get_env('DISCORD_TOKEN'));
