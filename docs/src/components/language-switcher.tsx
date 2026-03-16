"use client";

import {setLocaleInCookie, useLocale} from "@/lib/i18n";
import {useNavigate, useLocation} from "react-router-dom";
import {useState} from "react";

export function LanguageSwitcher() {
	const locale = useLocale();
	const navigate = useNavigate();
	const location = useLocation();
	const [, setTick] = useState(0);

	function switchLocale(next: "vi" | "en") {
		setLocaleInCookie(next);

		// Get current path and switch locale prefix
		const currentPath = location.pathname;
		const currentLocale = currentPath.split("/")[1] || "vi";

		// Build new path with new locale
		let newPath = currentPath.replace(`/${currentLocale}`, `/${next}`);

		// If we're at root or invalid locale path, go to new locale root
		if (!newPath.startsWith(`/${next}`)) {
			newPath = `/${next}`;
		}

		// Force re-render by updating state, then navigate
		setTick(t => t + 1);
		navigate(newPath);
	}

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				borderRadius: "6px",
				border: "1px solid var(--color-border)",
				overflow: "hidden",
				background: "var(--color-bg)",
			}}
		>
			<button
				onClick={() => switchLocale("vi")}
				style={{
					padding: "4px 10px",
					fontSize: "12px",
					fontWeight: 500,
					cursor: "pointer",
					transition: "all 0.15s",
					background: locale === "vi" ? "var(--color-accent)" : "transparent",
					color:
						locale === "vi" ? "var(--color-bg)" : "var(--color-text-tertiary)",
					border: "none",
				}}
			>
				VI
			</button>
			<div
				style={{
					width: "1px",
					height: "16px",
					background: "var(--color-border)",
				}}
			/>
			<button
				onClick={() => switchLocale("en")}
				style={{
					padding: "4px 10px",
					fontSize: "12px",
					fontWeight: 500,
					cursor: "pointer",
					transition: "all 0.15s",
					background: locale === "en" ? "var(--color-accent)" : "transparent",
					color:
						locale === "en" ? "var(--color-bg)" : "var(--color-text-tertiary)",
					border: "none",
				}}
			>
				EN
			</button>
		</div>
	);
}
