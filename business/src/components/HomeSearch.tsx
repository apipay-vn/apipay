import {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import type {Bank, LinkMode, Locale} from '../data/banks';
import type {Content} from '../content/vi';
import {localePath} from '../lib/hooks';
import {searchBanks} from '../lib/search';
import {BankLogo} from './BankLogo';
import {Highlight} from './Highlight';
import {ArrowRightIcon} from './Icons';
import {ModeTag} from './ModeTag';
import {SearchInput} from './SearchInput';

interface HomeSearchProps {
	locale: Locale;
	t: Content;
	maxResults?: number;
}

export function HomeSearch({locale, t, maxResults = 6}: HomeSearchProps) {
	const navigate = useNavigate();
	const [query, setQuery] = useState('');
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const results = useMemo(() => searchBanks(query), [query]);
	const trimmed = query.trim();
	const visible = results.slice(0, maxResults);

	useEffect(() => {
		const onPointerDown = (event: MouseEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', onPointerDown);
		return () => document.removeEventListener('mousedown', onPointerDown);
	}, []);

	const goToBank = (bank: Bank) => {
		setOpen(false);
		navigate(localePath(locale, `/banks/${bank.slug}`));
	};

	const goToIndex = () => {
		setOpen(false);
		const suffix = trimmed ? `?q=${encodeURIComponent(trimmed)}` : '';
		navigate(`${localePath(locale, '/banks')}${suffix}`);
	};

	return (
		<div ref={containerRef} className="relative mx-auto w-full max-w-xl">
			<form
				onSubmit={event => {
					event.preventDefault();
					goToIndex();
				}}
				role="search"
			>
				<SearchInput
					value={query}
					onChange={value => {
						setQuery(value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					placeholder={t.home.search.placeholder}
					ariaLabel={t.home.search.label}
					size="lg"
				/>
			</form>

			{trimmed ? (
				<p className="mt-2 text-center text-xs text-muted-foreground">{t.home.search.hint}</p>
			) : null}

			{open && trimmed ? (
				<div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
					{visible.length === 0 ? (
						<p className="px-4 py-6 text-center text-sm text-muted-foreground">{t.home.search.empty}</p>
					) : (
						<ul className="max-h-80 overflow-y-auto">
							{visible.map(bank => {
								const modes = Array.from(new Set(Object.values(bank.modes).filter(Boolean))) as LinkMode[];
								return (
									<li key={bank.slug}>
										<button
											type="button"
											onClick={() => goToBank(bank)}
											className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
										>
											<BankLogo bank={bank} className="h-10 w-10 shrink-0" />
											<span className="min-w-0 flex-1">
												<span className="block truncate text-sm font-medium">
													<Highlight text={bank.name} query={trimmed} />
												</span>
												<span className="block truncate text-xs text-muted-foreground">
													<Highlight text={bank.fullName} query={trimmed} />
												</span>
											</span>
											<span className="hidden shrink-0 gap-1 sm:flex">
												{modes.map(mode => (
													<ModeTag key={mode} mode={mode} locale={locale} />
												))}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					)}

					<button
						type="button"
						onClick={goToIndex}
						className="flex w-full items-center justify-center gap-1.5 border-t border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
					>
						{t.home.search.results}
						<ArrowRightIcon className="h-3.5 w-3.5" />
					</button>
				</div>
			) : null}
		</div>
	);
}
