export const DOCS_SITE_NAME = 'ApiPay';
export const DOCS_PRODUCT_NAME = 'ApiPay Docs';
export const DOCS_URL = 'https://docs.apipay.vn';
export const DOCS_DEFAULT_TITLE = `${DOCS_PRODUCT_NAME} | ${DOCS_SITE_NAME}`;
export const DOCS_DEFAULT_DESCRIPTION =
  'ApiPay API documentation and integration guides for Vietnamese bank transfer payments.';
export const DOCS_DEFAULT_IMAGE = `${DOCS_URL}/apipay-docs.jpg`;

export function createDocsTitle(pageTitle?: string) {
  return pageTitle ? `${pageTitle} | ${DOCS_PRODUCT_NAME} | ${DOCS_SITE_NAME}` : DOCS_DEFAULT_TITLE;
}

export function createCanonicalUrl(pathname: string) {
  const normalizedPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
  return `${DOCS_URL}${normalizedPath}`;
}

export function createStructuredData({
  pathname,
  title,
  description,
}: {
  pathname: string;
  title: string;
  description: string;
}) {
  const url = createCanonicalUrl(pathname);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: DOCS_SITE_NAME,
      alternateName: DOCS_PRODUCT_NAME,
      url: DOCS_URL,
      description: DOCS_DEFAULT_DESCRIPTION,
      publisher: {
        '@type': 'Organization',
        name: DOCS_SITE_NAME,
        url: 'https://apipay.vn',
        logo: {
          '@type': 'ImageObject',
          url: 'https://apipay.vn/apipay-logo.png',
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      url,
      description,
      isPartOf: {
        '@type': 'WebSite',
        name: DOCS_SITE_NAME,
        url: DOCS_URL,
      },
      about: {
        '@type': 'Organization',
        name: DOCS_SITE_NAME,
        url: 'https://apipay.vn',
      },
    },
  ];
}
