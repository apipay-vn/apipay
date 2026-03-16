import {useEffect, useState, useCallback} from "react";

const LOCALE_COOKIE = "NEXT_LOCALE";
const SUPPORTED_LOCALES = ["vi", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

// Get locale from cookie
export function getLocaleFromCookie(): Locale {
	if (typeof document === "undefined") return "vi";
	const cookie = document.cookie
		.split("; ")
		.find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
	const value = cookie?.split("=")[1];
	return SUPPORTED_LOCALES.includes(value as Locale) ? (value as Locale) : "vi";
}

// Get locale from browser (Accept-Language header) - only for first visit
export function getBrowserLocale(): Locale {
	if (typeof navigator === "undefined") return "vi";
	const lang = navigator.language.split("-")[0].toLowerCase();
	return SUPPORTED_LOCALES.includes(lang as Locale) ? (lang as Locale) : "vi";
}

// Hook to get current locale (with cookie fallback to browser for first visit)
export function useLocale(): Locale {
	const [locale, setLocale] = useState<Locale>("vi");

	// Listen for locale changes via custom event and update
	useEffect(() => {
		const handleLocaleChange = () => {
			const cookieLocale = getLocaleFromCookie();
			setLocale(cookieLocale);
		};

		// Initial load
		handleLocaleChange();

		window.addEventListener("apipay-locale-change", handleLocaleChange);
		return () => window.removeEventListener("apipay-locale-change", handleLocaleChange);
	}, []);

	return locale;
}

// Set locale in cookie and dispatch event
export function setLocaleInCookie(locale: Locale): void {
	document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000`;
	// Dispatch event to notify components of locale change
	if (typeof window !== "undefined") {
		window.dispatchEvent(new Event("apipay-locale-change"));
	}
}

// Get stored locale (from cookie), or null if first visit
export function getStoredLocale(): Locale | null {
	if (typeof document === "undefined") return null;
	const cookie = document.cookie
		.split("; ")
		.find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
	const value = cookie?.split("=")[1];
	if (!value) return null;
	return SUPPORTED_LOCALES.includes(value as Locale) ? (value as Locale) : null;
}
