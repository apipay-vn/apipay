import {useLocale} from '@/lib/i18n';
import {Link} from 'react-router-dom';

export type PromoBannerId = 'openapi' | 'pricing';

export const PROMO_BANNER_HEIGHT_REM = 2.25;

interface PromoBannerCopy {
  text: string;
  ctaLabel: string;
}

const BANNERS: Record<
  PromoBannerId,
  {en: PromoBannerCopy; vi: PromoBannerCopy; href: (locale: string) => string}
> = {
  openapi: {
    en: {text: 'Interactive OpenAPI reference — try every endpoint live.', ctaLabel: 'Open API Reference'},
    vi: {text: 'Tài liệu API tương tác chuẩn OpenAPI — thử ngay.', ctaLabel: 'Mở tài liệu API'},
    href: locale => `/${locale}/api-reference`,
  },
  pricing: {
    en: {text: 'New usage quota pricing — start free with 60 tx/month.', ctaLabel: 'See plans'},
    vi: {text: 'Bảng giá hạn mức mới — bắt đầu miễn phí với 60 GD/tháng.', ctaLabel: 'Xem bảng giá'},
    href: locale => `/${locale}/subscription`,
  },
};

export const PROMO_BANNER_ORDER: PromoBannerId[] = ['openapi', 'pricing'];

interface PromoBannerProps {
  visibleIds: PromoBannerId[];
  onClose: (id: PromoBannerId) => void;
}

export function PromoBanner({visibleIds, onClose}: PromoBannerProps) {
  const locale = useLocale();

  if (visibleIds.length === 0) {
    return null;
  }

  const isEn = locale === 'en';

  return (
    <div className="promo-banner-stack">
      {visibleIds.map(id => {
        const banner = BANNERS[id];
        const copy = isEn ? banner.en : banner.vi;

        return (
          <div className="promo-banner" role="note" key={id}>
            <span className="promo-badge">{isEn ? 'NEW' : 'MỚI'}</span>
            <span className="promo-text">{copy.text}</span>
            <Link to={banner.href(locale)} className="promo-cta">
              {copy.ctaLabel}
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 4L10 8L6 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <button
              className="promo-close"
              onClick={() => onClose(id)}
              aria-label={isEn ? 'Dismiss' : 'Đóng'}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        );
      })}

      <style>{`
				.promo-banner-stack {
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					z-index: 70;
					display: flex;
					flex-direction: column;
				}

				.promo-banner {
					position: relative;
					height: ${PROMO_BANNER_HEIGHT_REM}rem;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 0.5rem;
					padding: 0 3rem;
					background: var(--color-bg);
					border-bottom: 1px solid var(--color-border);
					font-size: 0.8rem;
					white-space: nowrap;
					overflow: hidden;
				}

				.promo-badge {
					font-size: 0.6rem;
					font-weight: 700;
					letter-spacing: 0.08em;
					padding: 0.15rem 0.4rem;
					border-radius: 99px;
					background: var(--color-text);
					color: var(--color-bg);
					text-transform: uppercase;
				}

				.promo-text {
					color: var(--color-text-secondary);
				}

				.promo-cta {
					display: inline-flex;
					align-items: center;
					gap: 0.35rem;
					color: var(--color-text);
					font-weight: 600;
					text-decoration: none;
					border-bottom: 1px solid currentColor;
					transition: opacity 0.15s;
				}

				.promo-cta:hover {
					opacity: 0.7;
				}

				.promo-close {
					position: absolute;
					right: 0.75rem;
					top: 50%;
					transform: translateY(-50%);
					display: flex;
					align-items: center;
					justify-content: center;
					width: 1.5rem;
					height: 1.5rem;
					background: none;
					border: none;
					border-radius: 4px;
					color: var(--color-text-tertiary);
					cursor: pointer;
					transition: all 0.15s;
				}

				.promo-close:hover {
					color: var(--color-text);
					background: var(--color-bg-hover);
				}

				.layout.banner-visible .navbar {
					top: var(--banner-height);
				}

				.layout.banner-visible .sidebar {
					top: calc(3.5rem + var(--banner-height));
				}

				.layout.banner-visible .toc {
					top: calc(3.5rem + var(--banner-height));
					height: calc(100vh - 3.5rem - var(--banner-height));
				}

				.layout.banner-visible .main-content {
					padding-top: calc(5rem + var(--banner-height));
				}

				@media (max-width: 640px) {
					.promo-banner {
						justify-content: flex-start;
						padding: 0 2.75rem 0 1rem;
					}

					.promo-text {
						display: none;
					}
				}
			`}</style>
    </div>
  );
}
