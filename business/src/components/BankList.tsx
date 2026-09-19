import {Link} from 'react-router-dom';
import type {Bank, Locale} from '../data/banks';
import {localePath} from '../lib/hooks';
import {cn} from '../lib/utils';
import {BankLogo} from './BankLogo';

interface BankListProps {
	banks: Bank[];
	activeSlug?: string;
	locale: Locale;
	empty?: string;
}

export function BankList({banks, activeSlug, locale, empty}: BankListProps) {
	if (banks.length === 0) {
		return <p className="px-3 py-6 text-center text-sm text-muted-foreground">{empty}</p>;
	}

	return (
		<ul className="space-y-0.5">
			{banks.map(bank => {
				const isActive = bank.slug === activeSlug;
				return (
					<li key={bank.slug}>
						<Link
							to={localePath(locale, `/banks/${bank.slug}`)}
							aria-current={isActive ? 'page' : undefined}
							className={cn(
								'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
								isActive
									? 'bg-muted font-medium text-foreground'
									: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
							)}
						>
							<BankLogo bank={bank} className="h-9 w-9 shrink-0" />
							<span className="min-w-0 flex-1 truncate">{bank.name}</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
