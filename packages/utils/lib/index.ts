import { AbortController } from 'abort-controller';
import { parseDate } from 'chrono-node';
import { HttpsProxyAgent } from 'https-proxy-agent';
import {
	type ColorResolvable,
	TimestampStyles,
	type TimestampStylesString,
	escapeInlineCode,
	inlineCode,
	time,
} from 'meinu';
import { type RequestInit as Options, type Response, default as _fetch } from 'node-fetch';
import { Vibrant } from 'node-vibrant/node';
import { createWriteStream } from 'node:fs';
import { setTimeout as wait_prom } from 'node:timers/promises';
import sharp from 'sharp';
import TurndownService from 'turndown';

export interface RequestInit extends Options {
	proxy?: boolean;
	timeout?: number;
}

export type Maybe<T> = T | undefined | null;
export type MaybePartial<T> = {
	[P in keyof T]?: Maybe<T[P]>;
};

async function get_proxy(): Promise<{ ip: string; port: string }> {
	const res = await fetch(
		'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=us&ssl=all&anonymity=all',
	);
	const list = await res.text();
	const proxies = list
		.split('\n')
		.map((proxy) => proxy.split(':'))
		.map(([ip, port]) => ({ ip, port }));
	return proxies[Math.floor(Math.random() * proxies.length)];
}

export async function fetch(url: string, _option: RequestInit = {}): Promise<Response> {
	const option = {
		..._option,
	};

	let timeout: Timer | undefined;
	if (_option.timeout) {
		const signal = new AbortController();
		timeout = setTimeout(() => signal.abort(), _option.timeout);

		option.signal = signal.signal;
	}

	if (_option.proxy) {
		const proxy = await get_proxy();
		option.agent = new HttpsProxyAgent(`http://${proxy.ip}:${proxy.port}`);
	}

	let res: Response;
	try {
		res = await _fetch(url, option);
	} catch (e) {
		clearTimeout(timeout);
		throw e;
	}
	clearTimeout(timeout);
	return res;
}

export async function get_json<T>(url: string, option: RequestInit = {}) {
	const res = await fetch(url, option);
	if (!res.ok) {
		throw new Error(`HTTP Error: ${res.status}`);
	}
	return res.json() as Promise<T>;
}

export async function get_text(url: string, option: RequestInit = {}) {
	const res = await fetch(url, option);
	if (!res.ok) {
		throw new Error(`HTTP Error: ${res.status}`);
	}
	return res.text();
}

export async function get_buf(url: string): Promise<Buffer> {
	const res = await fetch(url);
	if (!res.body) {
		throw new Error('No body');
	}
	return Buffer.from(await res.arrayBuffer());
}

export async function get_stream(url: string) {
	const res = await fetch(url);
	if (!res.body) {
		throw new Error('No body');
	}
	return res.body;
}

export async function url_to_file(url: string, path: string): Promise<string> {
	const file = createWriteStream(path);
	const req = await get_stream(url);
	return new Promise((resolve, reject) => {
		req.pipe(file);
		req.on('end', () => resolve(path));
		req.on('error', (err) => reject(err));
	});
}

export function nFormatter(num: number, digits = 1) {
	const si = [
		{ value: 1e18, symbol: 'E' },
		{ value: 1e15, symbol: 'P' },
		{ value: 1e12, symbol: 'T' },
		{ value: 1e9, symbol: 'G' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e3, symbol: 'k' },
	];
	let i: number;
	for (i = 0; i < si.length; i++) {
		if (num >= si[i].value) {
			return (num / si[i].value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[i].symbol;
		}
	}
	return num.toString();
}

export function bytesToSize(bytes: number): string {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return '0 Byte';
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${Math.round(bytes / 1024 ** i)} ${sizes[i]}`;
}

export function genString(length = 10) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export async function try_prom<T>(prom: Promise<T> | T | undefined, log = true): Promise<NonNullable<T> | undefined> {
	try {
		const res = await prom;
		if (res) {
			return res;
		}
	} catch (e) {
		if (log) {
			console.error(e);
		}
	}
}

export const inline_code = (str: string) => inlineCode(escapeInlineCode(str));

export async function is_error<T>(prom: Promise<T>): Promise<boolean> {
	try {
		await prom;
		return false;
	} catch (e) {
		return true;
	}
}

export function slugify(str: string) {
	return str
		.toLowerCase()
		.replace(/[^\w ]+/g, '')
		.replace(/ +/g, '-');
}

export function wait(ms: number) {
	return wait_prom(ms);
}

export function is_url(str: string) {
	try {
		new URL(str);
		return true;
	} catch (e) {
		return false;
	}
}

export async function get_image_color(image: Buffer | string, muted = false) {
	const buf = typeof image === 'string' ? await get_buf(image) : image;
	const img = await sharp(buf).png().toBuffer();
	const palette = await Vibrant.from(img).getPalette();
	if (muted) {
		if (palette.Muted) return palette.Muted.hex as ColorResolvable;
	}
	const main =
		palette.Vibrant ??
		palette.DarkVibrant ??
		palette.LightVibrant ??
		palette.Muted ??
		palette.DarkMuted ??
		palette.LightMuted;
	if (!main) return '#000000';
	return main.hex as ColorResolvable;
}

export const parse_date = (data: number | Date | string, timezone?: string) => {
	const date =
		typeof data === 'string'
			? parseDate(data, { timezone })
			: parseDate('now', { instant: new Date(data), timezone });
	return date ?? new Date();
};
export const time_str = (
	date: number | Date | string,
	style: TimestampStylesString = TimestampStyles.LongDateTime,
	timezone?: string,
) => time(parse_date(date, timezone), style);

export function relative_time(_date: number | Date | string) {
	const date = typeof _date === 'string' ? parse_date(_date) : new Date(_date);

	// like discord timestamps
	// Today at 3:00 PM
	// Yesterday at 3:00 PM
	// 1/1/2021 3:00 PM

	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const day_diff = Math.floor(diff / 86400000);

	if (Number.isNaN(day_diff) || day_diff < 0) return;

	const get_time = (date: Date) => {
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		return `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
	};

	if (day_diff === 0) return `Today at ${get_time(date)}`;
	if (day_diff === 1) return `Yesterday at ${get_time(date)}`;

	return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${get_time(date)}`;
}

export function csv_to_array<Headers extends string>(csv: string, headers: Headers[]): Record<Headers, string>[] {
	const lines = csv.split(/[\n]+/);
	const result: Record<Headers, string>[] = [];
	for (const line of lines) {
		const row: Record<Headers, string> = {} as Record<Headers, string>;
		const cells = line.split(',');
		for (let i = 0; i < cells.length; i++) {
			row[headers[i]] = cells[i];
		}
		result.push(row);
	}

	return result;
}

export function array_to_csv<T extends Record<string, string>>(array: Array<T>): string {
	const lines: string[] = [];
	for (const row of array) {
		const line: string[] = [];
		for (const key in row) {
			line.push(row[key]);
		}
		lines.push(line.join(','));
	}
	return lines.join('\n');
}

export const emojiMention = (id: string) => `<:_:${id}>`;
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
export const truncate = (str: string, len: number) => str.slice(0, len).trim() + (str.length > len ? '...' : '');

export const turndownService = new TurndownService();
export const turndown = (html: string) => turndownService.turndown(html);

export * as fileType from 'file-type';
export * from 'meinu';
export * from './env.js';

