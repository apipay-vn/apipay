import {ACCOUNT_TYPES, type AccountFlow, type AccountType, type Bank, type LinkMode, type Locale} from '../data/banks';
import type {Content} from '../content/vi';
import {cn} from '../lib/utils';
import {ChevronDownIcon} from './Icons';
import {ModeTag} from './ModeTag';

interface FlowAccordionProps {
	bank: Bank;
	type: AccountType;
	mode: LinkMode;
	flow: AccountFlow;
	locale: Locale;
	t: Content['banks'];
	open: boolean;
	onToggle: () => void;
}

export function FlowAccordion({bank, type, mode, flow, locale, t, open, onToggle}: FlowAccordionProps) {
	const meta = ACCOUNT_TYPES[type];

	return (
		<div className="overflow-hidden rounded-lg border border-border bg-card">
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={open}
				className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
			>
				<span className="flex min-w-0 items-center gap-3">
					<span className="flex h-7 w-9 shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold">
						{meta.short}
					</span>
					<span className="min-w-0">
						<span className="block truncate font-medium">{meta[locale]}</span>
						<span className="block truncate text-xs text-muted-foreground">
							{bank.name} · {flow.steps.length} {locale === 'vi' ? 'bước' : 'steps'}
						</span>
					</span>
				</span>
				<span className="flex shrink-0 items-center gap-2">
					<ModeTag mode={mode} locale={locale} />
					<ChevronDownIcon className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
				</span>
			</button>

			{open ? (
				<div className="border-t border-border px-4 py-4">
					<ol className="space-y-3">
						{flow.steps.map((step, index) => (
							<li key={step.title} className="flex gap-3">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
									{index + 1}
								</span>
								<div className="min-w-0 space-y-0.5 pt-0.5">
									<p className="text-sm font-medium">{step.title}</p>
									{step.body ? <p className="text-sm text-muted-foreground">{step.body}</p> : null}
								</div>
							</li>
						))}
					</ol>

					{flow.notes && flow.notes.length > 0 ? (
						<div className="mt-4 rounded-md border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-500/25 dark:bg-amber-500/10">
							<p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
								{t.detail.notesTitle}
							</p>
							<ul className="list-disc space-y-1 pl-4 text-sm text-amber-900 dark:text-amber-100">
								{flow.notes.map(note => (
									<li key={note}>{note}</li>
								))}
							</ul>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}
