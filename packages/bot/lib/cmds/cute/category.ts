import type { cute } from '@kaede/apis';
import type { Category } from './types';

export const create_category = <
	ImageType extends keyof cute.NekoImageCategories,
	K extends cute.NekoImageCategories[ImageType][number],
>({
	type,
	category,
	required,
	cb,
}: Category<ImageType, K>): Category<ImageType, K> => ({
	type,
	category,
	required,
	cb,
});
