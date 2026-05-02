import {viSidebarConfig, enSidebarConfig, type SidebarItem} from "@/sidebar.config";
import {useLocale} from "@/lib/i18n";
import {useEffect, useState} from "react";
import {Link, useLocation} from "react-router-dom";

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

function isLinkActive(href: string | undefined, pathname: string, hash: string) {
	if (!href) {
		return false;
	}

	if (href.includes("#")) {
		return `${pathname}${hash}` === href;
	}

	return pathname === href;
}

function isLinkOnCurrentPage(href: string | undefined, pathname: string) {
	if (!href || !href.includes("#")) {
		return false;
	}

	return href.split("#")[0] === pathname;
}

function SidebarLink({item, depth = 0, onClick}: {item: SidebarItem; depth?: number; onClick?: () => void}) {
	const location = useLocation();
	const isActive = isLinkActive(item.href, location.pathname, location.hash);

	if (item.href) {
		if (item.external) {
			return (
				<a
					href={item.href}
					target="_blank"
					rel="noopener noreferrer"
					className="sidebar-link"
					style={{paddingLeft: `${1 + depth * 0.75}rem`}}
					onClick={onClick}
				>
					{item.label}
				</a>
			);
		}

		return (
			<Link
				to={item.href}
				className={`sidebar-link ${isActive ? "active" : ""}`}
				style={{paddingLeft: `${1 + depth * 0.75}rem`}}
				onClick={onClick}
			>
				{item.label}
			</Link>
		);
	}

	return null;
}

function SidebarGroup({item, onLinkClick}: {item: SidebarItem; onLinkClick?: () => void}) {
	const location = useLocation();
	const isChildActive =
		item.children?.some((child) =>
			isLinkActive(child.href, location.pathname, location.hash) ||
			isLinkOnCurrentPage(child.href, location.pathname),
		) ?? false;
	const [isOpen, setIsOpen] = useState(isChildActive);

	useEffect(() => {
		if (isChildActive) setIsOpen(true);
	}, [isChildActive]);

	return (
		<div className="sidebar-group">
			<button
				className={`sidebar-group-toggle ${isOpen ? "open" : ""}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				<span>{item.label}</span>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					className={`sidebar-chevron ${isOpen ? "rotated" : ""}`}
				>
					<path
						d="M6 4L10 8L6 12"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
			{isOpen && (
				<div className="sidebar-group-children">
					{item.children?.map((child) => (
						<SidebarLink key={child.href} item={child} depth={1} onClick={onLinkClick} />
					))}
				</div>
			)}
		</div>
	);
}

export function Sidebar({isOpen, onClose}: SidebarProps) {
	const locale = useLocale();
	const sidebarConfig = locale === "en" ? enSidebarConfig : viSidebarConfig;

	return (
		<>
			{/* Mobile overlay */}
			{isOpen && (
				<div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
			)}

			<aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
				<nav className="sidebar-nav" aria-label="Main navigation">
					{sidebarConfig.map((item) =>
						item.children ? (
							<SidebarGroup key={item.label} item={item} onLinkClick={onClose} />
						) : (
							<SidebarLink key={item.href} item={item} onClick={onClose} />
						),
					)}
				</nav>
			</aside>

			<style>{`
				.sidebar-overlay {
					display: none;
					position: fixed;
					inset: 0;
					background: var(--color-bg-overlay);
					z-index: 40;
					animation: slideInOverlay 0.2s ease;
				}

				.sidebar {
					position: fixed;
					top: 3.5rem;
					left: 0;
					bottom: 0;
					width: var(--spacing-sidebar);
					background: var(--color-bg-sidebar);
					border-right: 1px solid var(--color-border-light);
					overflow-y: auto;
					z-index: 50;
					padding: 1.5rem 0;
					transition: transform 0.25s ease;
				}

				.sidebar-nav {
					display: flex;
					flex-direction: column;
					gap: 2px;
				}

				.sidebar-link {
					display: block;
					padding: 0.4rem 1rem 0.4rem 1.25rem;
					font-size: 0.875rem;
					color: var(--color-text-secondary);
					text-decoration: none;
					border-left: 2px solid transparent;
					transition: all 0.15s ease;
					line-height: 1.5;
				}

				.sidebar-link:hover {
					color: var(--color-text);
					background: var(--color-bg-hover);
				}

				.sidebar-link.active {
					color: var(--color-accent);
					font-weight: 500;
					border-left-color: var(--color-accent);
					background: var(--color-accent-light);
				}

				.sidebar-group {
					margin-top: 0.25rem;
				}

				.sidebar-group-toggle {
					display: flex;
					align-items: center;
					justify-content: space-between;
					width: 100%;
					padding: 0.4rem 1rem 0.4rem 1.25rem;
					font-size: 0.8rem;
					font-weight: 600;
					color: var(--color-text);
					background: none;
					border: none;
					cursor: pointer;
					text-transform: uppercase;
					letter-spacing: 0.04em;
					transition: color 0.15s;
				}

				.sidebar-group-toggle:hover {
					color: var(--color-accent);
				}

				.sidebar-chevron {
					transition: transform 0.2s ease;
					flex-shrink: 0;
				}

				.sidebar-chevron.rotated {
					transform: rotate(90deg);
				}

				.sidebar-group-children {
					animation: fadeIn 0.2s ease;
				}

				@media (max-width: 1024px) {
					.sidebar {
						transform: translateX(-100%);
					}

					.sidebar.sidebar-open {
						transform: translateX(0);
					}

					.sidebar-overlay {
						display: block;
					}
				}
			`}</style>
		</>
	);
}
