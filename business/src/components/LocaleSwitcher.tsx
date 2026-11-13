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
			data-slot="toggle-group"
			className="flex items-center p-0.5"
			role="group"
			aria-label="Language"
		>
			{LOCALES.map(code => (
				<button
					key={code}
					type="button"
					onClick={() => switchTo(code)}
					aria-pressed={code === locale}
					data-slot="toggle-group-item"
					data-state={code === locale ? 'on' : 'off'}
					className={cn(
						'px-2.5 py-1 text-xs font-medium uppercase',
						code === locale ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
					)}
				>
					{code}
				</button>
			))}
		</div>
	);
}
