import { create_category, mention } from './util';

export const multi_user = [
	// new
	create_category({
		type: 'gif',
		category: 'baka',
		desc: 'Call someone a baka',
		cb: (v) => `${mention(v)} called ${mention(v, true)} a baka 😡`,
	}),
	create_category({
		type: 'gif',
		category: 'kick',
		desc: 'Kick someone',
		cb: (v) => `${mention(v)} kicked ${mention(v, true)} 😡`,
	}),
	create_category({
		type: 'gif',
		category: 'peck',
		desc: 'Peck someone',
		cb: (v) => `${mention(v)} pecked ${mention(v, true)} 😘`,
	}),
	create_category({
		type: 'gif',
		category: 'nope',
		desc: 'Say nope to someone',
		cb: (v) => `${mention(v)} said nope to ${mention(v, true)} 🙂‍↔️`,
	}),
	create_category({
		type: 'gif',
		category: 'nod',
		desc: 'Nod at someone',
		cb: (v) => `${mention(v)} nodded at ${mention(v, true)} 🙂‍↕️`,
	}),
	create_category({
		type: 'gif',
		category: 'pout',
		desc: 'Pout at someone',
		cb: (v) => `${mention(v)} pouted at ${mention(v, true)} 😡`,
	}),
	create_category({
		type: 'gif',
		category: 'yeet',
		desc: 'Yeet someone',
		cb: (v) => `${mention(v)} yeeted ${mention(v, true)} 😡`,
	}),
	// old
	create_category({
		type: 'gif',
		category: 'kiss',
		desc: 'Kiss someone',
		cb: (v) => `${mention(v)} kissed ${mention(v, true)} 😘`,
	}),
	create_category({
		type: 'gif',
		category: 'hug',
		desc: 'Hug someone',
		cb: (v) => `${mention(v)} hugged ${mention(v, true)} 🤗`,
	}),
	create_category({
		type: 'gif',
		category: 'tickle',
		desc: 'Tickle someone',
		cb: (v) => `${mention(v)} tickled ${mention(v, true)} 😂`,
	}),
	create_category({
		type: 'gif',
		category: 'pat',
		desc: 'Pat someone',
		cb: (v) => `${mention(v)} patted ${mention(v, true)} 🥺`,
	}),
	create_category({
		type: 'gif',
		category: 'poke',
		desc: 'Poke someone',
		cb: (v) => `${mention(v)} poked ${mention(v, true)} 😬`,
	}),
	create_category({
		type: 'gif',
		category: 'bite',
		desc: 'Bite someone',
		cb: (v) => `${mention(v)} bit ${mention(v, true)} 😬`,
	}),

	create_category({
		type: 'gif',
		category: 'slap',
		desc: 'Slap someone',
		cb: (v) => `${mention(v)} slapped ${mention(v, true)} 😬`,
	}),
	create_category({
		type: 'gif',
		category: 'cuddle',
		desc: 'Cuddle with someone',
		cb: (v) => `${mention(v)} is cuddling with ${mention(v, true)} 😊`,
	}),
	create_category({
		type: 'gif',
		category: 'feed',
		desc: 'Feed someone',
		cb: (v) => `${mention(v)} is feeding ${mention(v, true)} 🥺`,
	}),
	create_category({
		type: 'gif',
		category: 'handshake',
		desc: 'Handshake',
		cb: (v) => `${mention(v)} is shaking hands with ${mention(v, true)} 🤝`,
	}),
	create_category({
		type: 'gif',
		category: 'handhold',
		desc: 'Handhold',
		cb: (v) => `${mention(v)} is holding hands with ${mention(v, true)} 🥺`,
	}),
	create_category({
		type: 'gif',
		category: 'highfive',
		desc: 'Highfive',
		cb: (v) => `${mention(v)} is highfiving ${mention(v, true)} 🖐️`,
	}),
	create_category({
		type: 'gif',
		category: 'punch',
		desc: 'Punch',
		cb: (v) => `${mention(v)} is punching ${mention(v, true)} 😬`,
	}),
	create_category({
		type: 'gif',
		category: 'shoot',
		desc: 'Shoot',
		cb: (v) => `${mention(v)} is shooting ${mention(v, true)} 🔫`,
	}),
];
