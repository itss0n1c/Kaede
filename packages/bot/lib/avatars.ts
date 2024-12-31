import type { ColorResolvable } from '@kaede/utils';
import type { Kaede } from '.';

export class KaedeAvatars {
	current_color: ColorResolvable;
	constructor(inst: Kaede) {
		this.current_color = inst.color;
	}
}
