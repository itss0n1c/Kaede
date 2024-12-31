import * as apis from '@kaede/apis';
import { type ColorResolvable, GatewayIntentBits, Meinu, Partials, Routes, get_env } from '@kaede/utils';
import { KaedeAvatars } from './avatars.js';
import cmds from './cmds/index.js';

export class Kaede extends Meinu {
	avatars = new KaedeAvatars(this);
	apis = apis;
	constructor() {
		super({
			name: 'Kaede',
			color: '#f2d9c3',
			clientOptions: {
				intents: [GatewayIntentBits.Guilds],
				partials: [Partials.Channel, Partials.Message],
			},
		});
	}

	get bot_color(): ColorResolvable {
		return this.avatars.current_color ?? this.color;
	}

	get install_link(): string {
		if (!this.application) throw new Error('Application not initialized');
		const url = new URL(Routes.oauth2Authorization(), this.options.rest?.api);
		const params = new URLSearchParams();
		params.append('client_id', this.application.id);
		if (this.application.installParams?.scopes)
			params.append('scope', this.application.installParams?.scopes.join(' '));
		url.search = params.toString();
		return url.toString();
	}

	static async start() {
		const kaede = new Kaede();
		return kaede.register_commands(cmds).init(get_env('DISCORD_TOKEN'));
	}
}

await Kaede.start();
