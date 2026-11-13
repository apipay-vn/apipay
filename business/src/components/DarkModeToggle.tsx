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
			data-slot="button"
			data-variant="ghost"
			className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"
		>
			{isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
		</button>
	);
}
