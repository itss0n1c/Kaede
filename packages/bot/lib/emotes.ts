import { emoji_mention } from '@kaede/utils';
import { bot } from '.';

const make_emoji = <Slug extends string, isAnimated extends boolean>(
	slug: Slug,
	desc: string,
	opts?: { is_animated: isAnimated },
) => ({
	slug,
	desc,
	is_animated: opts?.is_animated ?? false,
});

const emotes = [
	// kaede emotes
	make_emoji('spin', 'Kaede twirling her hands in a circle', { is_animated: true }),
	make_emoji('surprised', 'Kaede looking surprised'),
	make_emoji('sparkle', "Kaede's eyes sparkling"),
	make_emoji('peek', 'Kaede peeking out from behind a wall'),
	make_emoji('wave', 'Kaede waving'),
	make_emoji('ohayo', 'Kaede saying good morning', { is_animated: true }),
	make_emoji('thinking', 'Kaede thinking'),
	make_emoji('happy', 'Kaede smiling'),
	make_emoji('cute', 'Kaede looking cute'),
	make_emoji('woah', 'Kaede exclaiming "woah"'),
	make_emoji('yay', 'Kaede cheering'),
	make_emoji('study', 'Kaede studying'),
	make_emoji('chrimmy', 'Kaede in a Christmas outfit'),
	make_emoji('grin', 'Kaede grinning'),
	make_emoji('sip', 'Kaede sipping tea'),
	make_emoji('smile', 'Kaede with a big smile'),
	make_emoji('blush', 'Kaede blushing'),
	make_emoji('sad', 'Kaede looking sad'),
	// utility emotes
	make_emoji('empty', 'a blank emoji, for when you need to fill a slot'),
];

export default function <Slug extends (typeof emotes)[number]['slug']>(slug: Slug) {
	const emoji = emotes.find((e) => e.slug === slug);
	const item = bot.application?.emojis.cache.find((e) => e.name === slug);
	if (!emoji || !item) throw new Error(`Emoji ${slug} not found`);
	return emoji_mention(item);
}
