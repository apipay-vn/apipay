import {MODE_TAGS, type LinkMode, type Locale} from '../data/banks';
import {cn} from '../lib/utils';

const MODE_STYLES: Record<LinkMode, string> = {
	otp: 'border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-100',
	redirect: 'border-sky-200 bg-sky-100 text-sky-900 dark:border-sky-400/30 dark:bg-sky-400/15 dark:text-sky-100',
	manual: 'border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-100',
};

interface ModeTagProps {
	mode: LinkMode;
	locale: Locale;
	className?: string;
}

export function ModeTag({mode, locale, className}: ModeTagProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
				MODE_STYLES[mode],
				className
			)}
		>
			{MODE_TAGS[mode][locale]}
		</span>
	);
}
