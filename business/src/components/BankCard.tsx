import {Link} from 'react-router-dom';
import {ACCOUNT_TYPES, ACCOUNT_TYPE_KEYS, type Bank, type LinkMode, type Locale} from '../data/banks';
import type {Content} from '../content/vi';
import {localePath} from '../lib/hooks';
import {cn} from '../lib/utils';
import {BankLogo} from './BankLogo';
import {Highlight} from './Highlight';
import {ModeTag} from './ModeTag';
import {ArrowRightIcon} from './Icons';

interface BankCardProps {
	bank: Bank;
	locale: Locale;
	t: Content['banks'];
	query?: string;
}

export function BankCard({bank, locale, t, query = ''}: BankCardProps) {
	const modes = Array.from(new Set(Object.values(bank.modes).filter(Boolean))) as LinkMode[];

	return (
		<Link
			to={localePath(locale, `/banks/${bank.slug}`)}
			className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
		>
			<div className="flex items-start gap-3">
				<BankLogo bank={bank} className="h-14 w-14 shrink-0" />
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="truncate font-semibold">
							<Highlight text={bank.name} query={query} />
						</span>
					</div>
					<p className="truncate text-xs text-muted-foreground">
						<Highlight text={bank.fullName} query={query} />
					</p>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-1.5">
				{modes.map(mode => (
					<ModeTag key={mode} mode={mode} locale={locale} />
				))}
			</div>

			<div className="flex items-center justify-between border-t border-border pt-3">
				<div className="flex items-center gap-1">
					{ACCOUNT_TYPE_KEYS.map(type => {
						const meta = ACCOUNT_TYPES[type];
						const supported = bank.accountTypes.includes(type);
						return (
							<span
								key={type}
								className={cn(
									'rounded px-1.5 py-0.5 text-[10px] font-semibold',
									supported ? 'bg-muted text-foreground' : 'text-muted-foreground/40 line-through'
								)}
							>
								{meta.short}
							</span>
						);
					})}
				</div>
				<span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
					{t.card.cta}
					<ArrowRightIcon className="h-3.5 w-3.5" />
				</span>
			</div>
		</Link>
	);
}
