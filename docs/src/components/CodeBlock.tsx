import type {ReactNode} from "react";
import {useCallback, useState, useEffect} from "react";
import {useLocale} from "../lib/i18n";
import {codeToHtml} from "shiki";

interface CodeBlockProps {
	children: ReactNode;
	className?: string;
}

export function CodeBlock({children, className}: CodeBlockProps) {
	const [copied, setCopied] = useState(false);
	const locale = useLocale();

	// Extract language from className (e.g., "language-bash" → "bash")
	const language = className?.replace("language-", "") || "";

	// Get code text from children
	const codeText = typeof children === "string"
		? children
		: String(children || "");

	const copyText = locale === "vi" ? "Sao chép" : "Copy";
	const copiedText = locale === "vi" ? "Đã sao chép" : "Copied";

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(codeText).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [codeText]);

	return (
		<div className="code-block-wrapper">
			<div className="code-block-header">
				<span>{language || "code"}</span>
				<button className="copy-button" onClick={handleCopy}>
					{copied ? `✓ ${copiedText}` : copyText}
				</button>
			</div>
			<pre className={className}>
				<code>{children}</code>
			</pre>
		</div>
	);
}

// Syntax highlighted code block with Shiki
interface HighlightedCodeProps {
	code: string;
	language: string;
}

export function HighlightedCode({code, language}: HighlightedCodeProps) {
	const [highlightedHtml, setHighlightedHtml] = useState<string>("");
	const [copied, setCopied] = useState(false);
	const locale = useLocale();

	const copyText = locale === "vi" ? "Sao chép" : "Copy";
	const copiedText = locale === "vi" ? "Đã sao chép" : "Copied";

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(code).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [code]);

	// Map common language aliases
	const langMap: Record<string, string> = {
		js: "javascript",
		ts: "typescript",
		sh: "bash",
		shell: "bash",
		yaml: "yaml",
		json: "json",
		py: "python",
		rb: "ruby",
		php: "php",
	};

	const mappedLang = langMap[language] || language;

	useEffect(() => {
		const highlight = async () => {
			try {
				const html = await codeToHtml(code.trim(), {
					lang: mappedLang || "text",
					themes: {
						light: "github-light",
						dark: "github-dark",
					},
				});
				setHighlightedHtml(html);
			} catch {
				// Fallback if language not supported
				setHighlightedHtml(`<pre><code>${code}</code></pre>`);
			}
		};
		highlight();
	}, [code, mappedLang]);

	if (!highlightedHtml) {
		// Show loading state
		return (
			<div className="code-block-wrapper">
				<div className="code-block-header">
					<span>{language || "code"}</span>
				</div>
				<pre className={`language-${language}`}>
					<code>{code}</code>
				</pre>
			</div>
		);
	}

	return (
		<div className="code-block-wrapper">
			<div className="code-block-header">
				<span>{language || "code"}</span>
				<button className="copy-button" onClick={handleCopy}>
					{copied ? `✓ ${copiedText}` : copyText}
				</button>
			</div>
			<div
				className="shiki-code-block"
				dangerouslySetInnerHTML={{__html: highlightedHtml}}
			/>
		</div>
	);
}
