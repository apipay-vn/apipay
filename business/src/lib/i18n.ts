import {en} from '../content/en';
import {vi} from '../content/vi';
import type {Locale} from '../data/banks';

export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const DEFAULT_LOCALE: Locale = 'vi';
export const LOCALES: Locale[] = ['vi', 'en'];

const CONTENT = {vi, en};

export function getContent(locale: Locale) {
	return CONTENT[locale];
}

export function isLocale(value: string | undefined): value is Locale {
	return value === 'vi' || value === 'en';
}

export function readLocaleCookie(): Locale {
	if (typeof document === 'undefined') return DEFAULT_LOCALE;
	const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
	const value = match?.[1] ? decodeURIComponent(match[1]) : undefined;
	return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function writeLocaleCookie(locale: Locale): void {
	if (typeof document === 'undefined') return;
	document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
