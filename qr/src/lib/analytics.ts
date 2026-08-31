const GOOGLE_TAG_ID = 'G-QCMK7YQYMS';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function getPageLocation(pathname: string, search: string) {
  return `${pathname}${search}`;
}

export function trackPageView(pathname: string, search = '') {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  const pagePath = getPageLocation(pathname, search);

  window.gtag('config', GOOGLE_TAG_ID, {
    page_path: pagePath,
    page_title: document.title,
    page_location: `${window.location.origin}${pagePath}`,
  });
}

export function trackGenerateQr(bankCode?: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'generate_qr', {
    event_category: 'engagement',
    event_label: bankCode || 'unknown',
  });
}

