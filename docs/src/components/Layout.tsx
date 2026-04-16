import {searchItems} from '@/utils/searchIndex';
import {useCallback, useEffect, useState} from 'react';
import {Outlet, useLocation} from 'react-router-dom';
import {Navbar} from './Navbar';
import {SearchDialog} from './SearchDialog';
import {Sidebar} from './Sidebar';
import {TableOfContents} from './TableOfContents';

interface LayoutProps {
  routeTitles: Record<string, string>;
}

function normalizePathname(pathname: string) {
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function Layout({routeTitles}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
    const pageTitle = routeTitles[normalizePathname(pathname)];
    document.title = pageTitle ? `${pageTitle} | ApiPay Docs` : 'ApiPay Docs';
  }, [pathname, routeTitles]);

  return (
    <div className="layout">
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
