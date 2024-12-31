import { expect, test } from 'bun:test';
import { anilist } from '.';

test('test', async () => {
	const res = await anilist.search('one piece', 'ANIME');
	console.log(res);

	expect(1).toBe(1);
});
