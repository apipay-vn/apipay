import {useCallback, useEffect, useState} from "react";
import {useLocation} from "react-router-dom";

interface TocItem {
	id: string;
	text: string;
	level: number;
}

export function TableOfContents() {
	const [headings, setHeadings] = useState<TocItem[]>([]);
	const [activeId, setActiveId] = useState<string>("");
	const location = useLocation();

	// Extract headings from DOM
	useEffect(() => {
		const findHeadings = () => {
			const content = document.querySelector(".mdx-content");
			if (!content) return;

			const elements = content.querySelectorAll("h2, h3");
			const items: TocItem[] = Array.from(elements).map((el) => ({
				id: el.id,
				text: el.textContent?.replace(/#$/, "").trim() || "",
				level: parseInt(el.tagName[1]),
			}));
			setHeadings(items);
		};

		// Delay to allow MDX to render
		const timer = setTimeout(findHeadings, 100);
		return () => clearTimeout(timer);
	}, [location.pathname]);

	// Scroll spy with IntersectionObserver
	const observeHeadings = useCallback(() => {
		if (headings.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{
				rootMargin: "-80px 0px -60% 0px",
				threshold: 0.1,
			},
		);

		for (const heading of headings) {
			const el = document.getElementById(heading.id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, [headings]);

	useEffect(() => {
		return observeHeadings();
	}, [observeHeadings]);

	if (headings.length === 0) return null;

	return (
		<aside className="toc">
			<h4 className="toc-title">Trên trang này</h4>
			<nav className="toc-nav">
				{headings.map((heading) => (
					<a
						key={heading.id}
						href={`#${heading.id}`}
						className={`toc-link ${heading.level === 3 ? "toc-link-nested" : ""} ${
							activeId === heading.id ? "toc-link-active" : ""
						}`}
						onClick={(e) => {
							e.preventDefault();
							const el = document.getElementById(heading.id);
							el?.scrollIntoView({behavior: "smooth"});
							setActiveId(heading.id);
						}}
					>
						{heading.text}
					</a>
				))}
			</nav>

			<style>{`
				.toc {
					position: fixed;
					top: 3.5rem;
					right: 0;
					width: var(--spacing-toc);
					height: calc(100vh - 3.5rem);
					padding: 1.5rem 1rem 1.5rem 0;
					overflow-y: auto;
				}

				.toc-title {
					font-size: 0.75rem;
					font-weight: 600;
					text-transform: uppercase;
					letter-spacing: 0.06em;
					color: var(--color-text);
					margin-bottom: 0.75rem;
					padding-left: 0.75rem;
				}

				.toc-nav {
					display: flex;
					flex-direction: column;
					gap: 1px;
				}

				.toc-link {
					display: block;
					padding: 0.3rem 0.75rem;
					font-size: 0.8rem;
					line-height: 1.4;
					color: var(--color-text-tertiary);
					text-decoration: none;
					border-left: 2px solid transparent;
					transition: all 0.15s;
				}

				.toc-link:hover {
					color: var(--color-text-secondary);
				}

				.toc-link-nested {
					padding-left: 1.25rem;
				}

				.toc-link-active {
					color: var(--color-accent);
					border-left-color: var(--color-accent);
				}

				@media (max-width: 1280px) {
					.toc {
						display: none;
					}
				}
			`}</style>
		</aside>
	);
}
