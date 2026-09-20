import {useMemo, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {ACCOUNT_TYPES, ACCOUNT_TYPE_KEYS, findBankBySlug, type AccountType, type Bank, type Locale} from '../data/banks';
import {localePath, useDocumentTitle, useLocale} from '../lib/hooks';
import {searchBanks} from '../lib/search';
import {cn} from '../lib/utils';
import {ArrowLeftIcon, ExternalLinkIcon} from '../components/Icons';
import {AttachmentList} from '../components/AttachmentList';
import {BankList} from '../components/BankList';
import {BankLogo} from '../components/BankLogo';
import {FlowAccordion} from '../components/FlowAccordion';
import {SearchInput} from '../components/SearchInput';
import {SettlementTable} from '../components/SettlementTable';
import {NotFound} from './NotFound';

function BankPicker({
	query,
	onQueryChange,
	banks,
	activeSlug,
	locale,
	placeholder,
	ariaLabel,
	empty,
}: {
	query: string;
	onQueryChange: (value: string) => void;
	banks: Bank[];
	activeSlug: string;
	locale: Locale;
	placeholder: string;
	ariaLabel: string;
	empty: string;
}) {
	return (
		<>
			<div className="mb-3">
				<SearchInput
					value={query}
					onChange={onQueryChange}
					placeholder={placeholder}
					ariaLabel={ariaLabel}
					size="sm"
				/>
			</div>
			<BankList banks={banks} activeSlug={activeSlug} locale={locale} empty={empty} />
		</>
	);
}

export function BankDetail() {
	const {slug} = useParams<{slug: string}>();
	const {locale, t} = useLocale();
	const bank = findBankBySlug(slug);

	const [listQuery, setListQuery] = useState('');
	const [activeType, setActiveType] = useState<AccountType | undefined>(
		() => bank?.accountTypes[0]
	);
	const [seenSlug, setSeenSlug] = useState(slug);

	if (slug !== seenSlug) {
		setSeenSlug(slug);
		setActiveType(bank?.accountTypes[0]);
		setListQuery('');
	}

	useDocumentTitle(
		bank ? `${bank.name} | ${t.banks.title} | ${t.common.brand}` : `${t.banks.title} | ${t.common.brand}`
	);

	const listBanks = useMemo(() => searchBanks(listQuery), [listQuery]);

	if (!bank) return <NotFound />;

	const supportedTypes = ACCOUNT_TYPE_KEYS.filter(type => bank.accountTypes.includes(type));
	const attachments = t.getAttachments(bank);

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<div className="grid gap-8 lg:grid-cols-[260px_1fr]">
				<aside className="order-2 hidden lg:order-1 lg:block lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
					<BankPicker
						query={listQuery}
						onQueryChange={setListQuery}
						banks={listBanks}
						activeSlug={bank.slug}
						locale={locale}
						placeholder={t.banks.list.searchPlaceholder}
						ariaLabel={t.home.search.label}
						empty={t.banks.search.empty}
					/>
				</aside>

				<div className="order-1 min-w-0 lg:order-2">
					<Link
						to={localePath(locale, '/banks')}
						className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						<ArrowLeftIcon className="h-4 w-4" />
						{t.banks.detail.back}
					</Link>

					<details className="mb-5 rounded-lg border border-border bg-card lg:hidden">
						<summary className="cursor-pointer select-none px-3 py-2.5 text-sm font-medium">
							{t.banks.list.switchLabel}
						</summary>
						<div className="border-t border-border p-2">
							<BankPicker
								query={listQuery}
								onQueryChange={setListQuery}
								banks={listBanks}
								activeSlug={bank.slug}
								locale={locale}
								placeholder={t.banks.list.searchPlaceholder}
								ariaLabel={t.home.search.label}
								empty={t.banks.search.empty}
							/>
						</div>
					</details>

					<header className="flex flex-col gap-4 sm:flex-row sm:items-start">
						<div className="flex min-w-0 flex-1 items-start gap-4">
							<BankLogo bank={bank} className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
							<div className="min-w-0">
								<h1 className="text-2xl font-bold tracking-tight">{bank.name}</h1>
								<p className="mt-1 text-muted-foreground">{bank.fullName}</p>
								<div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
									<span>
										{t.banks.detail.bin}: <span className="font-mono">{bank.bin}</span>
									</span>
									<span className="font-mono">{bank.code}</span>
								</div>
							</div>
						</div>
						<a
							href="https://my.apipay.vn"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
						>
							{t.banks.detail.linkCta}
							<ExternalLinkIcon className="h-3.5 w-3.5" />
						</a>
					</header>

					<p className="mt-3 text-xs text-muted-foreground">{t.banks.detail.linkHint}</p>

					<section className="mt-8">
						<div className="mb-3">
							<h2 className="text-lg font-semibold">{t.banks.detail.filter}</h2>
						</div>
						<div className="mb-4 flex flex-wrap gap-2">
							{supportedTypes.map(type => {
								const meta = ACCOUNT_TYPES[type];
								return (
									<button
										key={type}
										type="button"
										onClick={() => setActiveType(type)}
										aria-pressed={activeType === type}
										className={cn(
											'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
											activeType === type
												? 'border-primary bg-primary text-primary-foreground'
												: 'border-border bg-card text-muted-foreground hover:text-foreground'
										)}
									>
										{meta.short}
										<span className="ml-1.5 font-normal opacity-80">{meta[locale]}</span>
									</button>
								);
							})}
						</div>

						<div className="mb-3">
							<h2 className="text-lg font-semibold">{t.banks.detail.settlementTitle}</h2>
							<p className="text-sm text-muted-foreground">{t.banks.detail.settlementSubtitle}</p>
						</div>
						<SettlementTable
							bank={bank}
							locale={locale}
							t={t.banks}
							activeType={activeType}
							onSelect={setActiveType}
						/>
					</section>

					<section className="mt-8">
						<div className="mb-3">
							<h2 className="text-lg font-semibold">{t.banks.detail.flowsTitle}</h2>
							<p className="text-sm text-muted-foreground">{t.banks.detail.flowsSubtitle}</p>
						</div>
						<div className="space-y-3">
							{supportedTypes.map(type => {
								const mode = bank.modes[type];
								if (!mode) return null;
								const base = t.getFlow(mode);
								const flow = {...base, notes: t.getNotes(bank, type)};
								return (
									<FlowAccordion
										key={type}
										bank={bank}
										type={type}
										mode={mode}
										flow={flow}
										locale={locale}
										t={t.banks}
										open={activeType === type}
										onToggle={() => setActiveType(activeType === type ? undefined : type)}
									/>
								);
							})}
						</div>
					</section>

					<section className="mt-8">
						<div className="mb-3">
							<h2 className="text-lg font-semibold">{t.banks.detail.attachmentsTitle}</h2>
							<p className="text-sm text-muted-foreground">{t.banks.detail.attachmentsSubtitle}</p>
						</div>
						<AttachmentList attachments={attachments} t={t.banks} />
					</section>
				</div>
			</div>
		</div>
	);
}
