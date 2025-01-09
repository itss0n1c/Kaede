import type { StringLike } from 'bun';
import { parseDate } from 'chrono-node';
import {
	AttachmentBuilder,
	type ColorResolvable,
	type Emoji,
	TimestampStyles,
	type TimestampStylesString,
	escapeInlineCode,
	inlineCode,
	time,
} from 'meinu';

import { Vibrant } from 'node-vibrant/node';
import { createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { Stream } from 'node:stream';
import sharp from 'sharp';
import TurndownService from 'turndown';
import UserAgents from 'user-agents';

export interface ReqInit extends RequestInit {
	timeout?: number;
	require_body?: boolean;
}

export type Maybe<T> = T | undefined | null;
export type MaybePartial<T> = {
	[P in keyof T]?: Maybe<T[P]>;
};

export async function fetch(url: string, _option: ReqInit = {}): Promise<Response> {
	const option = {
		..._option,
	};

	let timeout: Timer | undefined;
	if (_option.timeout) {
		option.signal = AbortSignal.timeout(_option.timeout);
	}

	let res: Response;
	try {
		res = await globalThis.fetch(url, option);
	} catch (e) {
		clearTimeout(timeout);
		throw e;
	}
	clearTimeout(timeout);

	if (_option.require_body) if (!res.ok || !res.body) throw new Error(`Invalid response from ${url}`);

	return res;
}

export const get_json = <T>(url: string, option: ReqInit = {}) =>
	fetch(url, { ...option, require_body: true }).then((res) => res.json() as Promise<T>);
export const get_text = (url: string, option: ReqInit = {}) =>
	fetch(url, { ...option, require_body: true }).then((res) => res.text());
export const get_buf = (url: string, option: ReqInit = {}) =>
	fetch(url, { ...option, require_body: true }).then((res) => res.arrayBuffer().then((buf) => Buffer.from(buf)));
export const get_stream = (url: string, option: ReqInit = {}) =>
	fetch(url, { ...option, require_body: true }).then((res) => res.body as ReadableStream<Uint8Array>);

export interface ReqClientInit {
	path: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	queries?: Record<string, StringLike>;
	headers?: RequestInit['headers'];
	body?: RequestInit['body'];
}

export function api_request_client(base: string) {
	return <T>({ path, method, queries, headers, body }: ReqClientInit) => {
		const url = new URL(base);
		url.pathname = join(url.pathname, path);
		if (queries) for (const [key, value] of Object.entries(queries)) url.searchParams.append(key, value.toString());
		return get_json<T>(url.toString(), {
			method: method ?? 'GET',
			headers,
			body,
		});
	};
}

export async function get_stream_node(url: string, option: ReqInit = {}): Promise<Stream> {
	const res = await get_stream(url, option);
	if (!res) throw new Error('Invalid response');
	const stream = new Stream.PassThrough();
	for await (const chunk of res) {
		stream.write(chunk);
	}
	stream.end();
	return stream;
}

export async function stream_to_attachment(url: string, name: string) {
	const res = await get_stream_node(url);
	return new AttachmentBuilder(res, { name });
}

export async function url_to_file(url: string, path: string) {
	const res = await get_stream(url);
	const stream = createWriteStream(path);
	for await (const chunk of res) {
		stream.write(chunk);
	}
	stream.end();
}

export function num_abbreviate(num: number, digits = 1) {
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

export function bytes_to_size(bytes: number): string {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return '0 Byte';
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${Math.round(bytes / 1024 ** i)} ${sizes[i]}`;
}

export function gen_string(length = 10) {
	let result = '';
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
	return result;
}

export async function try_prom<T>(prom: Promise<T> | T | undefined, log = true): Promise<NonNullable<T> | undefined> {
	try {
		const res = await prom;
		if (res) return res;
	} catch (e) {
		if (log) console.error(e);
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

export function is_url(str: string) {
	try {
		new URL(str);
		return true;
	} catch (e) {
		return false;
	}
}

export const to_png = (buf: Buffer) => sharp(buf).png().toBuffer();

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

export const emoji_mention = (emoji: Emoji) => `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
export const pluralize = (str: string, count: number) => (count === 1 ? str : `${str}s`);
export const truncate = (str: string, len: number) => str.slice(0, len).trim() + (str.length > len ? '...' : '');

const _turndown_service = new TurndownService();
export const turndown = (html: string) => _turndown_service.turndown(html);
export const md5 = (input: string) => new Bun.MD5().update(input).digest('hex');

export const useragent = (filter?: ConstructorParameters<typeof UserAgents>[0]) => new UserAgents(filter).toString();
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export * as fileType from 'file-type';
export { filesize } from 'filesize';
export * from 'meinu';
export { basename, extname, join } from 'node:path';
export * from './env.js';

