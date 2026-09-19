import {useDarkMode} from '../lib/hooks';
import {MoonIcon, SunIcon} from './Icons';

interface DarkModeToggleProps {
	label: string;
}

export function DarkModeToggle({label}: DarkModeToggleProps) {
	const {isDark, toggle} = useDarkMode();

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={label}
			title={label}
			className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
		>
			{isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
		</button>
	);
}
