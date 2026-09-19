import {useLocation, useNavigate} from 'react-router-dom';
import {LOCALES, writeLocaleCookie} from '../lib/i18n';
import {cn} from '../lib/utils';
import type {Locale} from '../data/banks';

interface LocaleSwitcherProps {
	locale: Locale;
}

export function LocaleSwitcher({locale}: LocaleSwitcherProps) {
	const navigate = useNavigate();
	const location = useLocation();

	const switchTo = (next: Locale) => {
		if (next === locale) return;
		writeLocaleCookie(next);
		const rest = location.pathname.replace(/^\/(vi|en)(?=\/|$)/, '');
		navigate(`/${next}${rest}${location.search}`, {replace: true});
	};

	return (
		<div
			className="flex items-center rounded-md border border-border p-0.5"
			role="group"
			aria-label="Language"
		>
			{LOCALES.map(code => (
				<button
					key={code}
					type="button"
					onClick={() => switchTo(code)}
					aria-pressed={code === locale}
					className={cn(
						'rounded px-2 py-1 text-xs font-medium uppercase transition-colors',
						code === locale
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					{code}
				</button>
			))}
		</div>
	);
}
