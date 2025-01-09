import { expect, test } from 'bun:test';
import { lookup } from '.';

async function sauce() {
	const url =
		'https://media.discordapp.net/attachments/1219348096245436588/1326924749862993991/d4aae8c9-a47f-491d-b2b1-572bdc9b3e7e.png?ex=67813279&is=677fe0f9&hm=947c3192a3b16967fd31ad3409c113246260faff38631624545763846eaad9a4&=&format=webp&quality=lossless&width=646&height=1249';

	const res = await lookup.saucenao.lookup(url);
	console.log(res);
}

test('test', async () => {
	await sauce();

	expect(1).toBe(1);
});
