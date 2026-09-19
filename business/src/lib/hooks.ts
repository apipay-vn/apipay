import {useCallback, useEffect, useState} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import {DEFAULT_LOCALE, getContent, isLocale} from './i18n';
import type {Locale} from '../data/banks';

const THEME_STORAGE_KEY = 'apipay-business-theme';

function getInitialDark(): boolean {
	if (typeof window === 'undefined') return false;
	const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
	if (stored === 'dark') return true;
	if (stored === 'light') return false;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useDarkMode() {
	const [isDark, setIsDark] = useState<boolean>(getInitialDark);

	useEffect(() => {
		document.documentElement.classList.toggle('dark', isDark);
		window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
	}, [isDark]);

	const toggle = useCallback(() => setIsDark(value => !value), []);
	return {isDark, toggle};
}

export function useLocale() {
	const {locale: param} = useParams<{locale: string}>();
	const locale: Locale = isLocale(param) ? param : DEFAULT_LOCALE;
	return {locale, t: getContent(locale)};
}

export function localePath(locale: Locale, path = ''): string {
	return `/${locale}${path}`;
}

export function useDocumentTitle(title: string) {
	useEffect(() => {
		document.title = title;
	}, [title]);
}

export function useScrollToTop() {
	const {pathname} = useLocation();
	useEffect(() => {
		window.scrollTo({top: 0, behavior: 'auto'});
	}, [pathname]);
}
