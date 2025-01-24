import * as apis from '@kaede/apis';
import {
	ActivityType,
	DefaultWebSocketManagerOptions,
	GatewayIntentBits,
	Meinu,
	Partials,
	Routes,
	get_env,
	wait,
} from '@kaede/utils';
import { schedule } from 'node-cron';
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

	static async start() {
		const inst = await new Kaede().registerCommands(cmds).init(get_env('DISCORD_TOKEN'));
		await inst.application?.emojis.fetch();
		init_server();

		await inst.guilds.fetch();
		while (inst.guilds.cache.some((g) => !g.available)) {
			console.log('Waiting for guilds to be available...');
			await wait(1000);
		}
		inst.setActivity();
		schedule('*/10 * * * *', () => inst.setActivity());

		return inst;
	}

	get thinking() {
		return `${this.emotes('thinking')} **Kaede** is thinking...`;
	}

	async setActivity() {
		console.time('setActivity');
		const app_users = this.application?.approximateUserInstallCount ?? 0;
		const members_count = await this.memberCount();
		const user_count = members_count + app_users;
		console.log(`Setting activity to "with ${user_count.toLocaleString()} people"`);
		this.user?.setActivity({
			type: ActivityType.Custom,
			name: `Playing with ${user_count.toLocaleString()} people`,
		});
		console.timeEnd('setActivity');
	}

	error_msg = (message: string) => ({
		content: `# Uh oh ${this.emotes('surprised')}\n${message}`,
		files: [],
		components: [],
	});
}

export const bot = await Kaede.start();
