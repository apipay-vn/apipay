import {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {ACCOUNT_TYPE_KEYS, BANKS} from '../data/banks';
import {useDocumentTitle, useLocale} from '../lib/hooks';
import {searchBanks} from '../lib/search';
import {BankCard} from '../components/BankCard';
import {Glossary} from '../components/Glossary';
import {SearchInput} from '../components/SearchInput';

export function BanksIndex() {
	const {locale, t} = useLocale();
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = useState(() => searchParams.get('q') ?? '');

	useDocumentTitle(`${t.banks.title} | ${t.common.brand} ${t.common.badge}`);

	const results = useMemo(() => searchBanks(query), [query]);

	useEffect(() => {
		const current = searchParams.get('q') ?? '';
		if (query === current) return;
		const next = new URLSearchParams(searchParams);
		if (query.trim()) next.set('q', query);
		else next.delete('q');
		setSearchParams(next, {replace: true});
	}, [query, searchParams, setSearchParams]);

	return (
		<div className="mx-auto max-w-6xl px-4 py-10">
			<header className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.banks.title}</h1>
				<p className="mt-2 max-w-2xl text-muted-foreground">{t.banks.subtitle}</p>
				<div className="mt-4 flex flex-wrap gap-6 text-sm">
					<span className="text-muted-foreground">
						<span className="font-semibold text-foreground">{BANKS.length}</span> {t.home.stats.banks}
					</span>
					<span className="text-muted-foreground">
						<span className="font-semibold text-foreground">{ACCOUNT_TYPE_KEYS.length}</span>{' '}
						{t.home.stats.accountTypes}
					</span>
				</div>
			</header>

			<section className="mb-10">
				<div className="mb-4">
					<h2 className="text-lg font-semibold">{t.banks.glossary.title}</h2>
					<p className="text-sm text-muted-foreground">{t.banks.glossary.subtitle}</p>
				</div>
				<Glossary terms={t.glossary} variant="table" />
			</section>

			<section>
				<div className="mb-4 max-w-md">
					<SearchInput
						value={query}
						onChange={setQuery}
						placeholder={t.banks.search.placeholder}
						ariaLabel={t.home.search.label}
					/>
				</div>

				{results.length === 0 ? (
					<p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
						{t.banks.search.empty}
					</p>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{results.map(bank => (
							<BankCard key={bank.slug} bank={bank} locale={locale} t={t.banks} query={query} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}
