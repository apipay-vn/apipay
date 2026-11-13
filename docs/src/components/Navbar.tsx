import {LanguageSwitcher} from "@/components/language-switcher";
import {useTheme} from "@/providers/ThemeProvider";
import {LogoIcon} from "./LogoIcon";

interface NavbarProps {
	onMenuToggle: () => void;
	onSearchOpen: () => void;
}

export function Navbar({onMenuToggle, onSearchOpen}: NavbarProps) {
	const {theme, toggleTheme} = useTheme();

	return (
		<header className="navbar">
			<div data-slot="site-header" aria-hidden className="navbar-glass" />
			<div className="navbar-inner">
				{/* Left section */}
				<div className="navbar-left">
					<button
						className="navbar-menu-btn"
						data-variant="ghost"
						onClick={onMenuToggle}
						aria-label="Toggle menu"
					>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path
								d="M3 5H17M3 10H17M3 15H17"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
							/>
						</svg>
					</button>
					<a href="/" className="navbar-logo">
						<span className="navbar-logo-icon">
							<LogoIcon />
						</span>
						<span className="navbar-logo-text">ApiPay</span>
						<span className="navbar-logo-badge">docs</span>
					</a>
				</div>

				{/* Right section */}
				<div className="navbar-right">
					<button className="navbar-search-btn" data-slot="search-trigger" onClick={onSearchOpen}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
						<span className="navbar-search-text">Tìm kiếm</span>
						<kbd className="navbar-search-kbd">⌘K</kbd>
					</button>

					<div className="navbar-lang-switch">
						<LanguageSwitcher />
					</div>

					<button
						className="navbar-icon-btn"
						data-variant="ghost"
						onClick={toggleTheme}
						aria-label="Toggle theme"
					>
						{theme === "light" ? (
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
							</svg>
						) : (
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<circle cx="12" cy="12" r="5" />
								<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
							</svg>
						)}
					</button>
				</div>
			</div>

			<style>{`
				.navbar {
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					height: 3.5rem;
					z-index: 60;
				}

				/* Reaches up behind the promo banners so the whole top bar is one sheet. */
				.navbar-glass {
					position: absolute;
					inset: calc(-1 * var(--banner-height, 0rem)) 0 0;
					z-index: -1;
					pointer-events: none;
				}

				.navbar-inner {
					display: flex;
					align-items: center;
					justify-content: space-between;
					height: 100%;
					padding: 0 1.25rem;
					max-width: 100%;
				}

				.navbar-left {
					display: flex;
					align-items: center;
					gap: 0.75rem;
				}

				.navbar-menu-btn {
					display: none;
					align-items: center;
					justify-content: center;
					width: 2rem;
					height: 2rem;
					border: 1px solid transparent;
					color: var(--color-text);
					cursor: pointer;
				}

				.navbar-logo {
					display: flex;
					align-items: center;
					gap: 0.6rem;
					text-decoration: none;
					color: var(--color-text);
				}

				.navbar-logo-icon {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 2.2rem;
					height: 2.2rem;
					color: var(--color-accent);
				}

				.navbar-logo-icon svg {
					width: 100%;
					height: 100%;
				}

				.navbar-logo-text {
					font-size: 1.25rem;
					font-weight: 700;
					letter-spacing: -0.02em;
				}

				.navbar-logo-badge {
					font-size: 0.65rem;
					font-weight: 600;
					color: var(--color-accent);
					background: var(--color-accent-light);
					padding: 0.1rem 0.45rem;
					border-radius: 99px;
					text-transform: uppercase;
					letter-spacing: 0.05em;
				}

				.navbar-right {
					display: flex;
					align-items: center;
					gap: 0.5rem;
				}

				.navbar-search-btn {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					padding: 0.4rem 0.75rem;
					border: 1px solid transparent;
					color: var(--color-text-tertiary);
					cursor: pointer;
					font-size: 0.85rem;
					min-width: 200px;
				}

				.navbar-search-btn:hover {
					color: var(--color-text-secondary);
				}

				.navbar-search-text {
					flex: 1;
					text-align: left;
				}

				.navbar-search-kbd {
					font-family: var(--font-mono);
					font-size: 0.7rem;
					padding: 0.1rem 0.35rem;
					background: var(--color-bg-tertiary);
					border: 1px solid var(--color-border);
					border-radius: 4px;
					color: var(--color-text-tertiary);
				}

				.navbar-icon-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 2rem;
					height: 2rem;
					border: 1px solid transparent;
					color: var(--color-text-secondary);
					cursor: pointer;
					text-decoration: none;
				}

				.navbar-icon-btn:hover {
					color: var(--color-text);
				}

				@media (max-width: 1024px) {
					.navbar-menu-btn {
						display: flex;
					}
				}

				@media (max-width: 640px) {
					.navbar-search-btn {
						min-width: auto;
						padding: 0.4rem;
					}

					.navbar-search-text,
					.navbar-search-kbd,
					.navbar-logo-text {
						display: none;
					}
				}

				.navbar-lang-switch {
					margin-left: 0.5rem;
				}
			`}</style>
		</header>
	);
}
