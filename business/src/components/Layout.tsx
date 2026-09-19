import {Link, Navigate, NavLink, Outlet, useParams} from 'react-router-dom';
import {isLocale} from '../lib/i18n';
import {localePath, useLocale} from '../lib/hooks';
import {cn} from '../lib/utils';
import {DarkModeToggle} from './DarkModeToggle';
import {ExternalLinkIcon} from './Icons';
import {LocaleSwitcher} from './LocaleSwitcher';
import {LogoIcon} from './LogoIcon';

const SUPPORT_EMAIL = 'support@apipay.vn';

const FOOTER_LINKS = [
	{key: 'home' as const, href: 'https://apipay.vn'},
	{key: 'dashboard' as const, href: 'https://my.apipay.vn'},
	{key: 'docs' as const, href: 'https://docs.apipay.vn'},
];

export function Layout() {
	const {locale: param} = useParams<{locale: string}>();
	const {locale, t} = useLocale();

	if (!isLocale(param)) {
		return <Navigate to="/vi" replace />;
	}

	const navItems = [
		{to: localePath(locale), label: t.common.nav.home, end: true},
		{to: localePath(locale, '/banks'), label: t.common.nav.banks, end: false},
	];

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
				<div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
					<Link to={localePath(locale)} className="flex items-center gap-2">
						<LogoIcon className="h-6 w-6 text-foreground" />
						<span className="font-mono text-base font-bold tracking-tight">{t.common.brand}</span>
						<span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
							{t.common.badge}
						</span>
					</Link>

					<nav className="hidden items-center gap-1 sm:flex">
						{navItems.map(item => (
							<NavLink
								key={item.to}
								to={item.to}
								end={item.end}
								className={({isActive}) =>
									cn(
										'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
										isActive
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:text-foreground'
									)
								}
							>
								{item.label}
							</NavLink>
						))}
					</nav>

					<div className="flex items-center gap-2">
						<DarkModeToggle label={t.common.theme.toggle} />
						<LocaleSwitcher locale={locale} />
					</div>
				</div>
			</header>

			<main className="flex-1">
				<Outlet />
			</main>

			<footer className="border-t border-border">
				<div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<LogoIcon className="h-5 w-5 text-foreground" />
							<span className="font-mono font-bold tracking-tight">{t.common.brand}</span>
						</div>
						<p className="max-w-xs text-sm text-muted-foreground">{t.common.footer.tagline}</p>
					</div>

					<div className="space-y-3">
						<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{t.common.footer.links}
						</div>
						<ul className="space-y-2 text-sm">
							{FOOTER_LINKS.map(link => (
								<li key={link.key}>
									<a
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
									>
										{t.common.footer.linkLabels[link.key]}
										<ExternalLinkIcon className="h-3.5 w-3.5" />
									</a>
								</li>
							))}
						</ul>
					</div>

					<div className="space-y-3">
						<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{t.common.footer.support}
						</div>
						<a
							href={`mailto:${SUPPORT_EMAIL}`}
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							{SUPPORT_EMAIL}
						</a>
					</div>
				</div>

				<div className="border-t border-border">
					<div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
						&copy; {new Date().getFullYear()} ApiPay JSC
					</div>
				</div>
			</footer>
		</div>
	);
}
