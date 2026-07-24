import type {ComponentPropsWithoutRef, ElementType, ReactNode} from "react";
import React, {useCallback, useState, useEffect} from "react";
import {codeToHtml} from "shiki";
import {CodeTabs} from "./CodeTabs";
import {PricingTabs} from "./PricingTabs";
import {OnboardingPricingTable} from "./OnboardingPricingTable";

/**
 * Creates a heading component with an anchor link.
 */
function createHeading(level: number) {
	const Tag = `h${level}` as ElementType;

	return function Heading(props: ComponentPropsWithoutRef<"h1">) {
		const {children, id, ...rest} = props;

		// Check if children contain an anchor tag - if so, use span to avoid nested <a> elements
		const hasAnchor = React.Children.toArray(children).some(
			(child) => React.isValidElement(child) && child.type === "a"
		);

		const Wrapper = hasAnchor ? "span" : "a";
		const wrapperProps = hasAnchor
			? {className: "heading-wrapper"}
			: {href: `#${id}`, className: "heading-anchor"};

		return (
			<Tag id={id} {...rest} className="group">
				{id ? (
					<Wrapper {...wrapperProps}>
						{children}
						{!hasAnchor && <span className="anchor-icon" aria-hidden="true">#</span>}
					</Wrapper>
				) : (
					children
				)}
			</Tag>
		);
	};
}

/**
 * Modern Callout component for documentation.
 */
function Callout({
	type = "info",
	children,
}: {
	type?: "info" | "warning" | "tip" | "danger";
	children: ReactNode;
}) {
	const styles = {
		info: "callout-info",
		warning: "callout-warning",
		tip: "callout-tip",
		danger: "callout-danger",
	};

	const icons = {
		info: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
		warning: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
		),
		tip: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
			</svg>
		),
		danger: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	};

	return (
		<div className={`callout ${styles[type]}`}>
			<div className="callout-icon">{icons[type]}</div>
			<div className="callout-body">{children}</div>
		</div>
	);
}

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

/**
 * Premium Syntax highlighted code block using Shiki.
 */
function CodeBlock({code, language}: {code: string; language: string}) {
	const [highlightedHtml, setHighlightedHtml] = useState<string>("");
	const [copied, setCopied] = useState(false);

	const mappedLang = langMap[language.toLowerCase()] || language || "text";

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(code).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [code]);

	useEffect(() => {
		let isMounted = true;
		const highlight = async () => {
			try {
				const html = await codeToHtml(code.trim(), {
					lang: mappedLang,
					themes: {
						light: "github-light",
						dark: "github-dark",
					},
				});
				if (isMounted) setHighlightedHtml(html);
			} catch (err) {
				console.error("Shiki error:", err);
				if (isMounted) setHighlightedHtml(`<pre class="shiki"><code>${code}</code></pre>`);
			}
		};
		highlight();
		return () => { isMounted = false; };
	}, [code, mappedLang]);

	return (
		<div className="code-block-container group">
			<div className="code-block-header">
				<div className="code-block-dots">
					<span className="dot dot-red"></span>
					<span className="dot dot-amber"></span>
					<span className="dot dot-green"></span>
				</div>
				<div className="code-block-meta">
					<span className="code-block-lang">{language || "code"}</span>
					<button className="copy-button" onClick={handleCopy}>
						{copied ? (
							<span className="flex items-center gap-1 text-green-500">
								<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
								</svg>
								Copied
							</span>
						) : (
							<span className="flex items-center gap-1">
								<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
								</svg>
								Copy
							</span>
						)}
					</button>
				</div>
			</div>
			<div className="code-block-body">
				{highlightedHtml ? (
					<div
						className="highlighted-html"
						dangerouslySetInnerHTML={{__html: highlightedHtml}}
					/>
				) : (
					<pre className="shiki-fallback">
						<code>{code}</code>
					</pre>
				)}
			</div>
		</div>
	);
}

/**
 * MDX component mapping for <code>.
 */
function Code(props: any) {
	const {className, children, isBlock: isBlockProp, ...rest} = props;
	const isBlock = isBlockProp || className?.startsWith("language-");

	if (isBlock) {
		const language = className?.replace("language-", "") || "";
		// Extract text content safely from children
		const codeText = Array.isArray(children)
			? children.join("")
			: typeof children === "string"
				? children
				: children?.props?.children || "";

		return <CodeBlock code={String(codeText).trim()} language={language} />;
	}

	return (
		<code className="inline-code" {...rest}>
			{children}
		</code>
	);
}

/**
 * MDX component mapping for <pre>.
 * We detect if the child is a <code> element and treat it as a block.
 */
function Pre(props: any) {
	const {children} = props;

	// If the child is a code element, we force it to be a block
	if (React.isValidElement(children) && (children.type === "code" || (children as any).props?.mdxType === "code")) {
		return <Code {...(children.props as any)} isBlock={true} />;
	}

	return <pre className="shiki-fallback">{children}</pre>;
}

export const mdxComponents = {
	h1: createHeading(1),
	h2: createHeading(2),
	h3: createHeading(3),
	h4: createHeading(4),
	code: Code,
	pre: Pre,
	Callout,
	CodeTabs,
	PricingTabs,
	OnboardingPricingTable,
	hr: (props: any) => <hr {...props} className="my-8 border-border-light" />,
	table: (props: any) => (
		<div className="table-container">
			<table {...props} />
		</div>
	),
};
