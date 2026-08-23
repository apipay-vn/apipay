import {searchItems} from '@/utils/searchIndex';
import {useCallback, useEffect, useState} from 'react';
import {Outlet, useLocation} from 'react-router-dom';
import {
  DOCS_DEFAULT_DESCRIPTION,
  DOCS_DEFAULT_IMAGE,
  DOCS_PRODUCT_NAME,
  DOCS_SITE_NAME,
  createCanonicalUrl,
  createDocsTitle,
  createStructuredData,
} from '@/lib/seo';
import {Navbar} from './Navbar';
import {PromoBanner} from './PromoBanner';
import {SearchDialog} from './SearchDialog';
import {Sidebar} from './Sidebar';
import {TableOfContents} from './TableOfContents';

interface LayoutProps {
  routeMetadata: Record<string, {title?: string; description?: string}>;
}

function normalizePathname(pathname: string) {
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

function upsertStructuredData(scriptId: string, payload: unknown) {
  let element = document.head.querySelector(`#${scriptId}`) as HTMLScriptElement | null;

  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.id = scriptId;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(payload);
}

export function Layout({routeMetadata}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const {pathname} = useLocation();

  const toggleSidebar = useCallback(() => setSidebarOpen(s => !s), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Global ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const normalizedPathname = normalizePathname(pathname);
    const metadata = routeMetadata[normalizedPathname];
    const title = createDocsTitle(metadata?.title);
    const description = metadata?.description || DOCS_DEFAULT_DESCRIPTION;
    const canonicalUrl = createCanonicalUrl(normalizedPathname);
    const structuredData = createStructuredData({pathname: normalizedPathname, title, description});

    document.title = title;

    upsertMeta('meta[name="description"]', {name: 'description', content: description});
    upsertMeta('meta[name="application-name"]', {name: 'application-name', content: DOCS_SITE_NAME});
    upsertMeta('meta[name="apple-mobile-web-app-title"]', {
      name: 'apple-mobile-web-app-title',
      content: DOCS_SITE_NAME,
    });
    upsertMeta('meta[property="og:title"]', {property: 'og:title', content: title});
    upsertMeta('meta[property="og:description"]', {property: 'og:description', content: description});
    upsertMeta('meta[property="og:site_name"]', {property: 'og:site_name', content: DOCS_SITE_NAME});
    upsertMeta('meta[property="og:type"]', {property: 'og:type', content: 'website'});
    upsertMeta('meta[property="og:url"]', {property: 'og:url', content: canonicalUrl});
    upsertMeta('meta[property="og:image"]', {property: 'og:image', content: DOCS_DEFAULT_IMAGE});
    upsertMeta('meta[name="twitter:card"]', {name: 'twitter:card', content: 'summary_large_image'});
    upsertMeta('meta[name="twitter:title"]', {name: 'twitter:title', content: title});
    upsertMeta('meta[name="twitter:description"]', {name: 'twitter:description', content: description});
    upsertMeta('meta[name="twitter:image"]', {name: 'twitter:image', content: DOCS_DEFAULT_IMAGE});
    upsertLink('link[rel="canonical"]', {rel: 'canonical', href: canonicalUrl});
    upsertStructuredData('apipay-docs-structured-data', structuredData);
  }, [pathname, routeMetadata]);

  return (
    <div className={`layout ${bannerVisible ? 'banner-visible' : ''}`}>
      <PromoBanner visible={bannerVisible} onClose={() => setBannerVisible(false)} />
      <Navbar onMenuToggle={toggleSidebar} onSearchOpen={() => setSearchOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="main-content">
        <article className="mdx-content animate-fade-in">
          <Outlet />
        </article>
      </main>

      <TableOfContents />

      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={searchItems} />

      <style>{`
				.layout {
					min-height: 100vh;
				}

				.main-content {
					margin-left: var(--spacing-sidebar);
					margin-right: var(--spacing-toc);
					padding: 5rem 2.5rem 3rem;
					min-height: 100vh;
				}

				@media (max-width: 1280px) {
					.main-content {
						margin-right: 0;
					}
				}

				@media (max-width: 1024px) {
					.main-content {
						margin-left: 0;
						padding: 4.5rem 1.5rem 3rem;
					}
				}

				@media (max-width: 640px) {
					.main-content {
						padding: 4rem 1rem 2rem;
					}
				}
			`}</style>
    </div>
  );
}
