import { env, join, ShardingManager } from '@kaede/utils';

const manager = new ShardingManager(join(import.meta.dir, './bot.ts'), { token: env.DISCORD_TOKEN });
manager.on('shardCreate', (shard) => console.log(`[Kaede] Launched shard ${shard.id}`));
await manager.spawn();
