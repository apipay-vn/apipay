import {Route, Routes} from 'react-router-dom';
import {Layout} from './components/Layout';
import {useScrollToTop} from './lib/hooks';
import {BankDetail} from './routes/BankDetail';
import {BanksIndex} from './routes/BanksIndex';
import {Home} from './routes/Home';
import {NotFound} from './routes/NotFound';
import {RootRedirect} from './routes/RootRedirect';

export default function App() {
	useScrollToTop();

	return (
		<Routes>
			<Route path="/" element={<RootRedirect />} />
			<Route path="/:locale" element={<Layout />}>
				<Route index element={<Home />} />
				<Route path="banks" element={<BanksIndex />} />
				<Route path="banks/:slug" element={<BankDetail />} />
				<Route path="*" element={<NotFound />} />
			</Route>
			<Route path="*" element={<RootRedirect />} />
		</Routes>
	);
}
