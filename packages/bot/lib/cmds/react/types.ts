import type { images } from '@kaede/apis';
import type {
	APIInteractionDataResolvedGuildMember,
	APIRole,
	ChatInputCommandInteraction,
	GuildMember,
	Role,
	User,
} from '@kaede/utils';

export type Mentionable = GuildMember | APIInteractionDataResolvedGuildMember | Role | APIRole | User;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyCuteResponseData = CuteResponseData<any, any>;

export type CuteResponseCB = (v: AnyCuteResponseData) => string;

export interface CategoryInit<
	ImageType extends keyof images.nekos.ImageCategories,
	K extends images.nekos.ImageCategories[ImageType][number],
> {
	type: ImageType;
	category: K;
	desc?: string;
	mentioning?: boolean;
	cb: CuteResponseCB;
}

export interface Category<
	ImageType extends keyof images.nekos.ImageCategories,
	K extends images.nekos.ImageCategories[ImageType][number],
> {
	type: ImageType;
	category: K;
	desc?: string;
	mentioning: boolean;
	cb: CuteResponseCB;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyCategory = Category<any, any>;

export interface CuteResponseData<
	ImageType extends keyof images.nekos.ImageCategories,
	K extends images.nekos.ImageCategories[ImageType][number],
> {
	type: ImageType;
	category: Category<ImageType, K>;
	int: ChatInputCommandInteraction;
	user: Mentionable;
	user2: Mentionable | null;
}
