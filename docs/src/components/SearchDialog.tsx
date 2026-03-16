import Fuse from "fuse.js";
import {useCallback, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";

interface SearchItem {
	title: string;
	description: string;
	href: string;
	section?: string;
}

interface SearchDialogProps {
	isOpen: boolean;
	onClose: () => void;
	items: SearchItem[];
}

export function SearchDialog({isOpen, onClose, items}: SearchDialogProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchItem[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	const fuse = useRef(
		new Fuse(items, {
			keys: ["title", "description", "section"],
			threshold: 0.3,
			includeScore: true,
		}),
	);

	// Update fuse index when items change
	useEffect(() => {
		fuse.current = new Fuse(items, {
			keys: ["title", "description", "section"],
			threshold: 0.3,
			includeScore: true,
		});
	}, [items]);

	// Focus input on open
	useEffect(() => {
		if (isOpen) {
			inputRef.current?.focus();
			setQuery("");
			setResults([]);
			setSelectedIndex(0);
		}
	}, [isOpen]);

	// Search
	useEffect(() => {
		if (query.trim() === "") {
			setResults(items.slice(0, 8));
		} else {
			const searchResults = fuse.current.search(query).map((r) => r.item);
			setResults(searchResults);
		}
		setSelectedIndex(0);
	}, [query, items]);

	const handleSelect = useCallback(
		(item: SearchItem) => {
			navigate(item.href);
			onClose();
		},
		[navigate, onClose],
	);

	// Keyboard navigation
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
					break;
				case "ArrowUp":
					e.preventDefault();
					setSelectedIndex((i) => Math.max(i - 1, 0));
					break;
				case "Enter":
					e.preventDefault();
					if (results[selectedIndex]) {
						handleSelect(results[selectedIndex]);
					}
					break;
				case "Escape":
					e.preventDefault();
					onClose();
					break;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, results, selectedIndex, handleSelect, onClose]);

	if (!isOpen) return null;

	return (
		<div className="search-overlay" onClick={onClose}>
			<div className="search-dialog" onClick={(e) => e.stopPropagation()}>
				<div className="search-input-wrap">
					<svg
						width="18"
						height="18"
						viewBox="0 0 16 16"
						fill="none"
						className="search-icon"
					>
						<circle
							cx="7"
							cy="7"
							r="5"
							stroke="currentColor"
							strokeWidth="1.5"
						/>
						<path
							d="M11 11L14 14"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
						/>
					</svg>
					<input
						ref={inputRef}
						type="text"
						className="search-input"
						placeholder="Tìm kiếm tài liệu..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
					<kbd className="search-esc">ESC</kbd>
				</div>

				{results.length > 0 && (
					<div className="search-results">
						{results.map((item, i) => (
							<button
								key={item.href}
								className={`search-result ${i === selectedIndex ? "search-result-active" : ""}`}
								onClick={() => handleSelect(item)}
								onMouseEnter={() => setSelectedIndex(i)}
							>
								<div className="search-result-title">{item.title}</div>
								{item.description && (
									<div className="search-result-desc">{item.description}</div>
								)}
								{item.section && (
									<div className="search-result-section">{item.section}</div>
								)}
							</button>
						))}
					</div>
				)}

				{query && results.length === 0 && (
					<div className="search-empty">
						Không tìm thấy kết quả cho "{query}"
					</div>
				)}
			</div>

			<style>{`
				.search-overlay {
					position: fixed;
					inset: 0;
					background: var(--color-bg-overlay);
					z-index: 100;
					display: flex;
					align-items: flex-start;
					justify-content: center;
					padding-top: 15vh;
					animation: slideInOverlay 0.15s ease;
				}

				.search-dialog {
					width: 100%;
					max-width: 560px;
					background: var(--color-bg);
					border: 1px solid var(--color-border);
					border-radius: 12px;
					box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
					overflow: hidden;
					animation: fadeIn 0.2s ease;
				}

				.search-input-wrap {
					display: flex;
					align-items: center;
					gap: 0.75rem;
					padding: 0.75rem 1rem;
					border-bottom: 1px solid var(--color-border-light);
				}

				.search-icon {
					color: var(--color-text-tertiary);
					flex-shrink: 0;
				}

				.search-input {
					flex: 1;
					background: none;
					border: none;
					outline: none;
					font-size: 1rem;
					color: var(--color-text);
					font-family: var(--font-mono);
				}

				.search-input::placeholder {
					color: var(--color-text-tertiary);
				}

				.search-esc {
					font-family: var(--font-mono);
					font-size: 0.65rem;
					padding: 0.15rem 0.35rem;
					background: var(--color-bg-tertiary);
					border: 1px solid var(--color-border);
					border-radius: 4px;
					color: var(--color-text-tertiary);
				}

				.search-results {
					max-height: 400px;
					overflow-y: auto;
					padding: 0.5rem;
				}

				.search-result {
					display: block;
					width: 100%;
					text-align: left;
					padding: 0.75rem 1rem;
					background: none;
					border: none;
					border-radius: 8px;
					cursor: pointer;
					transition: background 0.1s;
					font-family: var(--font-mono);
				}

				.search-result:hover,
				.search-result-active {
					background: var(--color-bg-hover);
				}

				.search-result-title {
					font-size: 0.9rem;
					font-weight: 500;
					color: var(--color-text);
					margin-bottom: 0.15rem;
				}

				.search-result-desc {
					font-size: 0.8rem;
					color: var(--color-text-tertiary);
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.search-result-section {
					font-size: 0.7rem;
					color: var(--color-accent);
					margin-top: 0.25rem;
				}

				.search-empty {
					padding: 2rem 1rem;
					text-align: center;
					color: var(--color-text-tertiary);
					font-size: 0.9rem;
				}
			`}</style>
		</div>
	);
}
