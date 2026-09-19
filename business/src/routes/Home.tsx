import {Link} from 'react-router-dom';
import {BANKS} from '../data/banks';
import {localePath, useDocumentTitle, useLocale} from '../lib/hooks';
import {ArrowRightIcon} from '../components/Icons';
import {Glossary} from '../components/Glossary';
import {HomeSearch} from '../components/HomeSearch';

export function Home() {
	const {locale, t} = useLocale();
	useDocumentTitle(`${t.home.title} | ${t.common.brand} ${t.common.badge}`);

	const stats = [
		{value: BANKS.length, label: t.home.stats.banks},
		{value: 3, label: t.home.stats.accountTypes},
	];

	return (
		<div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
			<div className="mx-auto max-w-3xl text-center">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.home.title}</h1>
				<p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">{t.home.subtitle}</p>
			</div>

			<div className="mt-8">
				<HomeSearch locale={locale} t={t} />
			</div>

			<div className="mx-auto mt-12 max-w-xl">
				<Link
					to={localePath(locale, '/banks')}
					className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/40"
				>
					<div className="min-w-0 flex-1">
						<span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
							{t.home.card.tag}
						</span>
						<h2 className="mt-2 text-lg font-semibold">{t.home.card.title}</h2>
						<p className="mt-1 text-sm text-muted-foreground">{t.home.card.description}</p>
						<div className="mt-4 flex items-center gap-4 text-sm">
							{stats.map(stat => (
								<span key={stat.label} className="text-muted-foreground">
									<span className="font-semibold text-foreground">{stat.value}</span> {stat.label}
								</span>
							))}
						</div>
					</div>
					<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-foreground">
						<ArrowRightIcon className="h-4 w-4" />
					</span>
				</Link>
			</div>

			<section className="mx-auto mt-16 max-w-3xl">
				<div className="mb-4">
					<h2 className="text-lg font-semibold">{t.home.glossary.title}</h2>
					<p className="text-sm text-muted-foreground">{t.home.glossary.subtitle}</p>
				</div>
				<Glossary terms={t.glossary} variant="chips" />
			</section>
		</div>
	);
}
