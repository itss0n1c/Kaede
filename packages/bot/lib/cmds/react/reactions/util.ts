import type { images } from '@kaede/apis';
import { GuildMember } from '@kaede/utils';
import type { AnyCuteResponseData, Category, CategoryInit } from '../types';

export const create_category = <
	ImageType extends keyof images.nekos.ImageCategories,
	K extends images.nekos.ImageCategories[ImageType][number],
>({
	type,
	category,
	desc,
	mentioning,
	cb,
}: CategoryInit<ImageType, K>): Category<ImageType, K> => ({
	type,
	category,
	desc,
	mentioning: mentioning ?? true,
	cb,
});

export function mention(v: AnyCuteResponseData, user2?: boolean) {
	if (!user2) return v.int.user;
	const res = v.int.options.data.at(0)?.options?.at(0)?.options?.at(0);
	if (!res) return 'someone';
	if (res.role) return `<@&${res.role.id}>`;
	if (res.member instanceof GuildMember) return res.member;
	if (res.user) return `<@${res.user.id}>`;
	return 'someone';
}

// export function mention(v: AnyCuteResponseData, user2?: boolean) {
// 	if (!user2) return v.int.user.displayName;
// 	const res = v.int.options.data.at(0)?.options?.at(0)?.options?.at(0);
// 	if (!res) return 'someone';
// 	if (res.role) return res.role.name;
// 	if (res.member instanceof GuildMember) return res.member.displayName;
// 	if (res.user) return res.user.username;
// 	return 'someone';
// }
