import {Layout} from '@/components/Layout';
import {mdxComponents} from '@/components/MDXComponents';
import {PageNavigation} from '@/components/PageNavigation';
import {getLocaleFromCookie} from '@/lib/i18n';
import {MDXProvider} from '@mdx-js/react';
import {useEffect} from 'react';
import {BrowserRouter, Navigate, Route, Routes, useLocation} from 'react-router-dom';

// Scroll to top on route change
function ScrollToTop() {
  const {pathname} = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Auto-discover all MDX files for both locales
const viModules = import.meta.glob('./content/vi/**/*.mdx', {
  eager: true,
}) as Record<string, {default: React.ComponentType; frontmatter?: Record<string, unknown>}>;

const enModules = import.meta.glob('./content/en/**/*.mdx', {
  eager: true,
}) as Record<string, {default: React.ComponentType; frontmatter?: Record<string, unknown>}>;

interface RouteConfig {
  path: string;
  Component: React.ComponentType;
  frontmatter?: Record<string, unknown>;
  locale: string;
}

// Map file paths to routes for a specific locale
function buildRoutes(
  modules: Record<string, {default: React.ComponentType; frontmatter?: Record<string, unknown>}>,
  locale: string
): RouteConfig[] {
  return Object.entries(modules).map(([filePath, module]) => {
    // ./content/en/index.mdx → /en
    // ./content/en/onboarding.mdx → /en/onboarding
    // ./content/en/api/payment-requests.mdx → /en/api/payment-requests
    let path = filePath.replace(`./content/${locale}/`, `/${locale}/`).replace('/index.mdx', '/').replace('.mdx', '');

    if (path === `/${locale}/`) {
      path = `/${locale}`;
    }

    if (path !== `/${locale}` && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    return {
      path,
      Component: module.default,
      frontmatter: module.frontmatter,
      locale,
    };
  });
}

// Build routes for both locales
const viRoutes = buildRoutes(viModules, 'vi');
const enRoutes = buildRoutes(enModules, 'en');
const allRoutes = [...viRoutes, ...enRoutes];

function DocPage({Component}: {Component: React.ComponentType}) {
  return (
    <>
      <Component />
      <PageNavigation />
    </>
  );
}

function NotFound({locale}: {locale: string}) {
  const text =
    locale === 'en'
      ? {
          title: '404',
          message: 'Page not found.',
          button: 'Go home',
        }
      : {
          title: '404',
          message: 'Trang bạn tìm không tồn tại.',
          button: 'Về trang chủ',
        };

  return (
    <div style={{textAlign: 'center', padding: '4rem 1rem'}}>
      <h1 style={{fontSize: '3rem', fontWeight: 700, marginBottom: '1rem'}}>{text.title}</h1>
      <p style={{color: 'var(--color-text-secondary)', fontSize: '1.1rem'}}>{text.message}</p>
      <a
        href={`/${locale}`}
        style={{
          display: 'inline-block',
          marginTop: '1.5rem',
          padding: '0.5rem 1.5rem',
          background: 'var(--color-accent)',
          color: 'var(--color-accent-light)',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        {text.button}
      </a>
    </div>
  );
}

// Root redirect to locale
function RootRedirect() {
  const locale = getLocaleFromCookie();
  return <Navigate to={`/${locale}`} replace />;
}

function getRouteTitle(frontmatter?: Record<string, unknown>) {
  const title = frontmatter?.title;
  return typeof title === 'string' && title.trim() ? title.trim() : undefined;
}

export default function App() {
  const locale = getLocaleFromCookie();
  const routeTitles = Object.fromEntries(
    allRoutes.flatMap(({path, frontmatter}) => {
      const title = getRouteTitle(frontmatter);
      return title ? [[path, title]] : [];
    })
  );

  return (
    <BrowserRouter>
      <ScrollToTop />
      <MDXProvider components={mdxComponents}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route element={<Layout routeTitles={routeTitles} />}>
            {allRoutes.map(({path, Component, frontmatter}) => (
              <Route
                key={path}
                path={path}
                element={<DocPage Component={Component} />}
                handle={{title: getRouteTitle(frontmatter)}}
              />
            ))}
            <Route path="*" element={<NotFound locale={locale} />} handle={{title: '404'}} />
          </Route>
        </Routes>
      </MDXProvider>
    </BrowserRouter>
  );
}
