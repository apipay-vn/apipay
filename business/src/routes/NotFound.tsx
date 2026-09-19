import {Link} from 'react-router-dom';
import {localePath, useLocale} from '../lib/hooks';

export function NotFound() {
	const {locale, t} = useLocale();

	return (
		<div className="mx-auto max-w-3xl px-4 py-24 text-center">
			<p className="text-sm font-semibold text-muted-foreground">404</p>
			<h1 className="mt-2 text-2xl font-bold tracking-tight">{t.common.notFound.title}</h1>
			<p className="mx-auto mt-3 max-w-md text-muted-foreground">{t.common.notFound.body}</p>
			<Link
				to={localePath(locale)}
				className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
			>
				{t.common.notFound.cta}
			</Link>
		</div>
	);
}
