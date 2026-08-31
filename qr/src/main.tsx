import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import './index.css';
import App from './App';
import {AnalyticsTracker} from './components/AnalyticsTracker';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/:slug" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
