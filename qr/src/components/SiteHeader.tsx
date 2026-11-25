import {Link, useLocation} from 'react-router-dom';
import {cn} from '../lib/utils';
import {LogoIcon} from './LogoIcon';

const TOOLS = [
  {to: '/', label: 'Tạo QR'},
  {to: '/giai-ma-vietqr', label: 'Giải mã QR'},
];

export function SiteHeader() {
  const {pathname} = useLocation();
  const activeTo = pathname.startsWith('/giai-ma-vietqr') ? '/giai-ma-vietqr' : '/';

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <a href="https://apipay.vn" className="flex items-center gap-2">
          <LogoIcon className="h-8 w-8 text-primary" />
          <span className="hidden font-mono text-xl font-bold sm:inline">ApiPay</span>
        </a>
        <nav data-slot="tabs-list" aria-label="Công cụ miễn phí" className="inline-flex rounded-lg bg-muted p-1">
          {TOOLS.map(t => (
            <Link
              key={t.to}
              to={t.to}
              onClick={() => window.scrollTo({top: 0})}
              data-slot="tabs-trigger"
              data-state={activeTo === t.to ? 'active' : 'inactive'}
              aria-current={activeTo === t.to ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:px-4',
                activeTo === t.to ? 'bg-card shadow-sm' : '!text-muted-foreground hover:!text-foreground'
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <a href="https://apipay.vn" className="hidden text-sm font-medium !text-muted-foreground transition-colors hover:!text-foreground md:inline">
          Trang chủ
        </a>
      </div>
    </header>
  );
}
