import {
	ACCOUNT_TYPES,
	ACCOUNT_TYPE_KEYS,
	generatesVa,
	type AccountType,
	type Bank,
	type Locale,
} from '../data/banks';
import type {Content} from '../content/vi';
import {cn} from '../lib/utils';

interface SettlementTableProps {
	bank: Bank;
	locale: Locale;
	t: Content['banks'];
	activeType?: AccountType;
	onSelect?: (type: AccountType) => void;
}

export function SettlementTable({bank, locale, t, activeType, onSelect}: SettlementTableProps) {
	const isVa = generatesVa(bank.bin);
	const method = isVa ? t.detail.settlementVa : t.detail.settlementOrigin;

	return (
		<div className="overflow-hidden rounded-lg border border-border bg-card">
			<table className="w-full text-sm">
				<thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
					<tr>
						<th className="px-4 py-2.5 font-semibold">{t.detail.filter}</th>
						<th className="px-4 py-2.5 font-semibold">{t.detail.settlementMethod}</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border">
					{ACCOUNT_TYPE_KEYS.map(type => {
						const meta = ACCOUNT_TYPES[type];
						const supported = bank.accountTypes.includes(type);
						const clickable = supported && Boolean(onSelect);

						return (
							<tr
								key={type}
								onClick={clickable ? () => onSelect?.(type) : undefined}
								className={cn(
									clickable && 'cursor-pointer transition-colors hover:bg-muted/40',
									activeType === type && supported && 'bg-muted/60'
								)}
							>
								<td className="px-4 py-3">
									<span className={cn('font-semibold', !supported && 'text-muted-foreground')}>
										{meta.short}
									</span>
									<span className="text-muted-foreground"> — {meta[locale]}</span>
								</td>
								<td className="px-4 py-3">
									{supported ? (
										<span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
											{method}
										</span>
									) : (
										<span className="text-xs italic text-muted-foreground">{t.detail.notSupported}</span>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
