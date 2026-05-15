import type {ReactElement, ReactNode} from "react";
import React, {useCallback, useEffect, useId, useMemo, useRef, useState} from "react";
import {codeToHtml} from "shiki";
import {useLocale} from "../lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TabInfo {
	language: string; // e.g. "javascript", "python", "php", "bash"
	label: string;    // Display label for the tab button
	code: string;     // Raw plain-text code content (no HTML)
}

interface CodeTabsProps {
	children: ReactNode;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const LANGUAGE_LABELS: Record<string, string> = {
	javascript: "JavaScript",
	python: "Python",
	php: "PHP",
	bash: "cURL",
};

const langMap: Record<string, string> = {
	js: "javascript",
	ts: "typescript",
	jsx: "jsx",
	tsx: "tsx",
	sh: "bash",
	shell: "bash",
	bash: "bash",
	yaml: "yaml",
	yml: "yaml",
	json: "json",
	py: "python",
	rb: "ruby",
	php: "php",
	go: "go",
	rust: "rust",
	rs: "rust",
};

const STORAGE_KEY = "apipay-docs-code-lang";
const LANG_CHANGE_EVENT = "apipay-code-lang-change";
const MAX_TABS = 10;

// ─── Preference Persistence ───────────────────────────────────────────────────

/** In-memory fallback when localStorage is unavailable */
let memoryLang: string | null = null;

export function getStoredLanguage(): string | null {
	try {
		if (typeof window !== "undefined" && window.localStorage) {
			return localStorage.getItem(STORAGE_KEY);
		}
	} catch {
		// localStorage unavailable (private browsing, SSR, etc.)
	}
	return memoryLang;
}

export function setStoredLanguage(lang: string): void {
	try {
		if (typeof window !== "undefined" && window.localStorage) {
			localStorage.setItem(STORAGE_KEY, lang);
		} else {
			memoryLang = lang;
		}
	} catch {
		// localStorage unavailable — fall back to in-memory
		memoryLang = lang;
	}

	// Notify other CodeTabs instances on the same page
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT));
	}
}

function getElementProps(element: ReactElement): Record<string, unknown> {
	return element.props as Record<string, unknown>;
}

function getElementTypeName(element: ReactElement): string {
	if (typeof element.type === "string") return element.type;

	const component = element.type as {displayName?: string; name?: string};
	return component.displayName ?? component.name ?? "";
}

function getLanguageFromClassName(className: unknown): string | null {
	if (typeof className !== "string") return null;

	const match = className.match(/(?:^|\s)language-([^\s]+)/);
	if (!match) return null;

	const rawLang = match[1].toLowerCase();
	return langMap[rawLang] ?? rawLang;
}

function getTitleFromProps(props: Record<string, unknown>): string | undefined {
	if (typeof props.title === "string" && props.title.trim()) return props.title.trim();
	if (typeof props["data-title"] === "string" && props["data-title"].trim()) {
		return props["data-title"].trim();
	}

	if (typeof props.metastring === "string") {
		const titleMatch = props.metastring.match(/title=(?:"([^"]+)"|'([^']+)'|([^\s]+))/);
		const title = titleMatch?.[1] ?? titleMatch?.[2] ?? titleMatch?.[3];
		if (title?.trim()) return title.trim();
	}

	return undefined;
}

function getTextContent(node: ReactNode): string {
	if (node == null || typeof node === "boolean") return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(getTextContent).join("");

	if (React.isValidElement(node)) {
		return getTextContent(getElementProps(node).children as ReactNode);
	}

	return "";
}

function parseCodeElement(element: ReactElement): TabInfo | null {
	const props = getElementProps(element);
	const language = getLanguageFromClassName(props.className);
	const elementName = getElementTypeName(element).toLowerCase();

	if (!language && elementName !== "code") return null;

	const title = getTitleFromProps(props);
	const label = title ?? LANGUAGE_LABELS[language ?? ""] ?? language ?? "Code";
	const code = getTextContent(props.children as ReactNode).trim();

	if (!code) return null;

	return {
		language: language ?? "text",
		label,
		code,
	};
}

function parsePreElement(element: ReactElement): TabInfo | null {
	const props = getElementProps(element);
	const children = React.Children.toArray(props.children as ReactNode);

	for (const child of children) {
		if (!React.isValidElement(child)) continue;

		const parsed = parseCodeElement(child);
		if (parsed) return parsed;
	}

	return null;
}

// ─── parseCodeChildren ────────────────────────────────────────────────────────

/**
 * Pure function that extracts tab information from React children passed by MDX.
 *
 * Expects children to be consecutive `<pre><code className="language-*">` elements.
 * Non-matching children are silently skipped. Output is capped at MAX_TABS (10).
 */
export function parseCodeChildren(children: ReactNode): TabInfo[] {
	const flat = React.Children.toArray(children);
	const tabs: TabInfo[] = [];

	for (const child of flat) {
		if (tabs.length >= MAX_TABS) break;

		if (!React.isValidElement(child)) continue;

		const parsed = parseCodeElement(child) ?? parsePreElement(child);
		if (parsed) tabs.push(parsed);
	}

	return tabs;
}

// ─── CodeTabs Component ───────────────────────────────────────────────────────

export function CodeTabs({children}: CodeTabsProps): ReactElement {
	const locale = useLocale();
	const instanceId = useId().replace(/:/g, "");
	const tabs = useMemo(() => parseCodeChildren(children), [children]);
	const tabsSignature = useMemo(
		() => tabs.map((tab) => `${tab.language}:${tab.code}`).join("|"),
		[tabs]
	);

	// Resolve initial active index from stored preference
	const resolveInitialIndex = (): number => {
		const stored = getStoredLanguage();
		if (stored) {
			const idx = tabs.findIndex((t) => t.language === stored);
			if (idx !== -1) return idx;
		}
		return 0;
	};

	const [activeIndex, setActiveIndex] = useState<number>(resolveInitialIndex);
	const [highlightedHtml, setHighlightedHtml] = useState<Map<string, string>>(new Map());
	const [copied, setCopied] = useState(false);
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// Locale-aware copy labels
	const copyText = locale === "vi" ? "Sao chép" : "Copy";
	const copiedText = locale === "vi" ? "Đã sao chép" : "Copied";

	useEffect(() => {
		setActiveIndex((currentIndex) => {
			const stored = getStoredLanguage();
			if (stored) {
				const storedIndex = tabs.findIndex((tab) => tab.language === stored);
				if (storedIndex !== -1) return storedIndex;
			}

			return currentIndex < tabs.length ? currentIndex : 0;
		});
	}, [tabs]);

	// Highlight all tabs on mount / when tabs change
	useEffect(() => {
		let isMounted = true;

		const highlightAll = async () => {
			const results = new Map<string, string>();

			await Promise.all(
				tabs.map(async (tab, idx) => {
					const key = `${idx}:${tab.language}`;
					const mappedLang = langMap[tab.language] ?? tab.language;
					try {
						const html = await codeToHtml(tab.code, {
							lang: mappedLang || "text",
							themes: {
								light: "github-light",
								dark: "dracula",
							},
						});
						results.set(key, html);
					} catch {
						// Plain-text fallback
						const escaped = tab.code
							.replace(/&/g, "&amp;")
							.replace(/</g, "&lt;")
							.replace(/>/g, "&gt;");
						results.set(key, `<pre class="shiki"><code>${escaped}</code></pre>`);
					}
				})
			);

			if (isMounted) setHighlightedHtml(results);
		};

		if (tabs.length > 0) {
			highlightAll();
		}

		return () => {
			isMounted = false;
		};
	}, [tabs, tabsSignature]);

	// Listen for cross-instance language change events
	useEffect(() => {
		const handleLangChange = () => {
			const stored = getStoredLanguage();
			if (stored) {
				const idx = tabs.findIndex((t) => t.language === stored);
				if (idx !== -1) setActiveIndex(idx);
			}
		};

		window.addEventListener(LANG_CHANGE_EVENT, handleLangChange);
		return () => window.removeEventListener(LANG_CHANGE_EVENT, handleLangChange);
	}, [tabs]);

	// Activate a tab and persist preference
	const activateTab = useCallback(
		(index: number) => {
			if (!tabs[index]) return;

			setActiveIndex(index);
			setStoredLanguage(tabs[index].language);
		},
		[tabs]
	);

	// Keyboard navigation for the tab bar
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
			if (tabs.length === 0) return;

			let nextIndex: number | null = null;

			if (e.key === "ArrowRight") {
				nextIndex = (index + 1) % tabs.length;
			} else if (e.key === "ArrowLeft") {
				nextIndex = (index - 1 + tabs.length) % tabs.length;
			} else if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				activateTab(index);
				return;
			}

			if (nextIndex !== null) {
				e.preventDefault();
				tabRefs.current[nextIndex]?.focus();
			}
		},
		[tabs.length, activateTab]
	);

	// Copy active tab code to clipboard
	const handleCopy = useCallback(() => {
		const activeTab = tabs[activeIndex];
		if (!activeTab) return;

		navigator.clipboard.writeText(activeTab.code).then(
			() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			},
			() => {
				// Clipboard API failed — silently ignore per spec
			}
		);
	}, [tabs, activeIndex]);

	// Render nothing if there are no valid code block children
	if (tabs.length === 0) {
		return <></>;
	}

	const activeTab = tabs[activeIndex];

	return (
		<div className="code-tabs-container">
			{/* Header: macOS dots + tab bar */}
			<div className="code-tabs-header">
				<div className="code-block-dots" aria-hidden="true">
					<span className="dot dot-red"></span>
					<span className="dot dot-amber"></span>
					<span className="dot dot-green"></span>
				</div>

				{/* Tab bar */}
				<div
					role="tablist"
					aria-label="Code language tabs"
					className="code-tabs-tablist"
				>
					{tabs.map((tab, idx) => {
						const isActive = idx === activeIndex;
						const tabId = `${instanceId}-code-tab-${idx}`;
						const panelId = `${instanceId}-code-panel-${idx}`;

						return (
							<button
								key={`${tab.language}-${idx}`}
								id={tabId}
								role="tab"
								aria-selected={isActive}
								aria-controls={panelId}
								tabIndex={isActive ? 0 : -1}
								className={`code-tab-button${isActive ? " code-tab-button--active" : ""}`}
								onClick={() => activateTab(idx)}
								onKeyDown={(e) => handleKeyDown(e, idx)}
								ref={(el) => {
									tabRefs.current[idx] = el;
								}}
							>
								{tab.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Code panel */}
			{tabs.map((tab, idx) => {
				const isActive = idx === activeIndex;
				const tabId = `${instanceId}-code-tab-${idx}`;
				const panelId = `${instanceId}-code-panel-${idx}`;
				const key = `${idx}:${tab.language}`;
				const html = highlightedHtml.get(key);

				return (
					<div
						key={`panel-${tab.language}-${idx}`}
						id={panelId}
						role="tabpanel"
						aria-labelledby={tabId}
						hidden={!isActive}
						className="code-tabs-panel"
					>
						<div className="code-tabs-panel-inner">
							{html ? (
								<div
									className="highlighted-html"
									dangerouslySetInnerHTML={{__html: html}}
								/>
							) : (
								<pre className="shiki-fallback">
									<code>{tab.code}</code>
								</pre>
							)}
						</div>

						{/* Copy button */}
						<button
							className="code-tabs-copy-button copy-button"
							onClick={handleCopy}
							aria-label={copied ? copiedText : copyText}
						>
							{copied ? (
								<span className="flex items-center gap-1 text-green-500">
									<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
									</svg>
									{copiedText}
								</span>
							) : (
								<span className="flex items-center gap-1">
									<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
									</svg>
									{copyText}
								</span>
							)}
						</button>
					</div>
				);
			})}
		</div>
	);
}
