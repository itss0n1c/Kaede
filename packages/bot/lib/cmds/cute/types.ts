import type { cute } from '@kaede/apis';
import type {
	APIInteractionDataResolvedGuildMember,
	APIRole,
	ChatInputCommandInteraction,
	GuildMember,
	Role,
	User,
} from '@kaede/utils';

type Mentionable = GuildMember | APIInteractionDataResolvedGuildMember | Role | APIRole | User;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyCuteResponseData = CuteResponseData<any, any>;

export type CuteResponseCB = (v: AnyCuteResponseData) => string;

export interface Category<
	ImageType extends keyof cute.NekoImageCategories,
	K extends cute.NekoImageCategories[ImageType][number],
> {
	type: ImageType;
	category: K;
	desc?: string;
	required?: boolean;
	cb?: CuteResponseCB;
}

export interface CuteResponseData<
	ImageType extends keyof cute.NekoImageCategories,
	K extends cute.NekoImageCategories[ImageType][number],
> {
	type: ImageType;
	category: Category<ImageType, K>;
	int: ChatInputCommandInteraction;
	user?: Mentionable;
	user2?: Mentionable | null;
}
