import {cn} from '../lib/utils';
import {SearchIcon} from './Icons';

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	ariaLabel: string;
	autoFocus?: boolean;
	onFocus?: () => void;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const SIZE_STYLES = {
	sm: 'h-9 pl-9 pr-3 text-sm',
	md: 'h-10 pl-10 pr-3 text-sm',
	lg: 'h-12 pl-11 pr-4 text-base',
} as const;

const ICON_STYLES = {
	sm: 'left-3 h-4 w-4',
	md: 'left-3 h-4 w-4',
	lg: 'left-4 h-4 w-4',
} as const;

export function SearchInput({
	value,
	onChange,
	placeholder,
	ariaLabel,
	autoFocus,
	onFocus,
	size = 'md',
	className,
}: SearchInputProps) {
	return (
		<div className={cn('relative', className)}>
			<SearchIcon
				className={cn('pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground', ICON_STYLES[size])}
			/>
			<input
				type="search"
				value={value}
				onChange={event => onChange(event.target.value)}
				placeholder={placeholder}
				aria-label={ariaLabel}
				autoFocus={autoFocus}
				onFocus={onFocus}
				className={cn(
					'w-full rounded-lg border border-border bg-card text-foreground outline-none transition-colors',
					'placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15',
					SIZE_STYLES[size]
				)}
			/>
		</div>
	);
}
