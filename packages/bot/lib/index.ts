import { EchoSharding, env, join } from '@kaede/utils';

const current_file_path = join(import.meta.path, '../..');
await EchoSharding.init(join(current_file_path, 'bot.ts'), env.DISCORD_TOKEN);
