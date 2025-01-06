import * as apis from '@kaede/apis';
import {
	ActivityType,
	DefaultWebSocketManagerOptions,
	GatewayIntentBits,
	Meinu,
	Partials,
	Routes,
	get_env,
} from '@kaede/utils';
import cmds from './cmds/index.js';
import emotes from './emotes.js';
import { init_server } from './server/index.js';

(DefaultWebSocketManagerOptions.identifyProperties as Record<string, unknown>).browser = 'Discord iOS';

export class Kaede extends Meinu {
	apis = apis;
	emotes = emotes;
	constructor() {
		super({
			name: 'Kaede',
			color: '#f2d9c3',
			client_options: {
				intents: [GatewayIntentBits.Guilds],
				partials: [Partials.Channel, Partials.Message],
				presence: {
					activities: [
						{
							type: ActivityType.Custom,
							name: 'panda addict 🐼💞',
						},
					],
					status: 'dnd',
				},
			},
		});
	}

	get install_link(): string {
		if (!this.application) throw new Error('Application not initialized');
		const url = new URL(Routes.oauth2Authorization(), this.options.rest?.api);
		const params = new URLSearchParams();
		params.append('client_id', this.application.id);
		url.search = params.toString();
		return url.toString();
	}

	static start = () => new Kaede().registerCommands(cmds).init(get_env('DISCORD_TOKEN'));

	get thinking() {
		return `${this.emotes('thinking')} **Kaede** is thinking...`;
	}

	error_msg = (message: string) => ({
		content: `# Uh oh ${this.emotes('surprised')}\n${message}`,
		files: [],
		components: [],
	});
}

export const bot = await Kaede.start();
await bot.application?.emojis.fetch();

init_server();
