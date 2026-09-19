import {Navigate} from 'react-router-dom';
import {readLocaleCookie} from '../lib/i18n';

export function RootRedirect() {
	return <Navigate to={`/${readLocaleCookie()}`} replace />;
}
