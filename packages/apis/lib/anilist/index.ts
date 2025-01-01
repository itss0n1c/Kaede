import { truncate, turndown } from '@kaede/utils';
import type { FuzzyDate, MediaFormat, MediaStatus } from 'anilist';

export * from './character';
export * from './media';

export function humanize_status(status: MediaStatus | null) {
	if (!status) return 'Unknown';
	if (status === 'FINISHED') return 'Finished';
	if (status === 'RELEASING') return 'Releasing';
	if (status === 'NOT_YET_RELEASED') return 'Not Yet Released';
	if (status === 'CANCELLED') return 'Cancelled';
	if (status === 'HIATUS') return 'Hiatus';
	return status;
}

export function humanize_format(format: MediaFormat | null) {
	if (!format) return 'Unknown';
	if (format === 'TV') return 'TV';
	if (format === 'TV_SHORT') return 'TV Short';
	if (format === 'MOVIE') return 'Movie';
	if (format === 'SPECIAL') return 'Special';
	if (format === 'OVA') return 'OVA';
	if (format === 'ONA') return 'ONA';
	if (format === 'MUSIC') return 'Music';
	if (format === 'MANGA') return 'Manga';
	if (format === 'NOVEL') return 'Novel';
	if (format === 'ONE_SHOT') return 'One Shot';
	return format;
}

export function emoji_format(format: MediaFormat | null) {
	if (!format) return '❓';
	if (format === 'TV') return '📺';
	if (format === 'TV_SHORT') return '📺';
	if (format === 'MOVIE') return '🎥';
	if (format === 'SPECIAL') return '🎥';
	if (format === 'OVA') return '📀';
	if (format === 'ONA') return '📱';
	if (format === 'MUSIC') return '🎵';
	if (format === 'MANGA') return '📖';
	if (format === 'NOVEL') return '📚';
	if (format === 'ONE_SHOT') return '📚';
	return '❓';
}

export const humanize_desc = (desc: string | null) =>
	desc ? truncate(turndown(desc), 250) : 'No description available.';

export function humanize_date(date: FuzzyDate | null) {
	if (!date) return '?';
	const { year, month, day } = date;
	const current = new Date();
	const current_year = current.getFullYear();

	if (current_year !== year) {
		if (!year) return '?';
		if (!month) return year.toString();
		if (!day) return `${year}-${month.toString().padStart(2, '0')}`;
		return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
	}

	if (!month) return '?';

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
	const month_str = months[month - 1];
	if (!day) return month_str;
	return `${month_str} ${day}${day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}`;
}
