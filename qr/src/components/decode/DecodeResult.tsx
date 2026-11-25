import {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import type {Bank} from '../../lib/banks';
import {API_URL, cn, formatVND} from '../../lib/utils';
import {amountInWords, fixCrc, type DecodedQr, type Issue, type TlvNode} from '../../lib/vietqr';
import {BankImage} from '../BankDropdown';
import {CopyButton} from './CopyButton';
import {PayloadView} from './PayloadView';

function simplify(nodes: TlvNode[]): unknown[] {
  return nodes.map(n => ({tag: n.path, name: n.name, length: n.length, ...(n.children ? {children: simplify(n.children)} : {value: n.value})}));
}

function Row({label, value, mono, copy = true, children}: {label: string; value?: string; mono?: boolean; copy?: boolean; children?: React.ReactNode}) {
  if (!value && !children) return null;
  return (
    <div className="flex items-start justify-between gap-3 border-t border-border/60 py-2.5 first:border-t-0">
      <dt className="shrink-0 pt-1 text-sm text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-start gap-1 text-right">
        <span className={cn('min-w-0 pt-1 text-sm font-medium break-words', mono && 'font-mono')}>{children ?? value}</span>
        {copy && value ? <CopyButton value={value} /> : <span className="w-8 shrink-0" />}
      </dd>
    </div>
  );
}

const ISSUE_STYLE: Record<Issue['level'], {box: string; icon: string; label: string}> = {
  error: {box: 'bg-red-500/10 text-red-700', icon: '!', label: 'Lỗi'},
  warn: {box: 'bg-amber-500/15 text-amber-700', icon: '!', label: 'Cảnh báo'},
  info: {box: 'bg-sky-500/10 text-sky-700', icon: 'i', label: 'Lưu ý'},
};

export function DecodeResult({result, bank}: {result: DecodedQr; bank?: Bank}) {
  const errors = result.issues.filter(i => i.level === 'error');
  const errorPaths = new Set(errors.map(e => e.path).filter((p): p is string => !!p));
  const [qrFailed, setQrFailed] = useState(false);
  const isCard = result.service === 'QRIBFTTC';

  const status = !result.isEmv
    ? {tone: 'amber', title: 'Không phải mã QR thanh toán', text: 'Nội dung này không theo chuẩn EMVCo/VietQR.'}
    : errors.length
      ? {tone: 'red', title: `Mã có ${errors.length} lỗi`, text: 'App ngân hàng có thể từ chối hoặc đọc sai mã này.'}
      : result.isVietQr
        ? {tone: 'green', title: 'Mã VietQR hợp lệ', text: 'Cấu trúc và mã kiểm tra CRC đều đúng chuẩn NAPAS.'}
        : {tone: 'amber', title: 'Mã QR EMVCo khác', text: 'Đúng chuẩn EMVCo nhưng không phải VietQR chuyển khoản NAPAS.'};

  const json = useMemo(
    () =>
      JSON.stringify(
        {
          valid: result.isVietQr && errors.length === 0,
          isVietQr: result.isVietQr,
          bank: result.bin ? {bin: result.bin, code: bank?.code ?? null, name: bank?.fullName ?? null} : null,
          accountNumber: result.accountNumber ?? null,
          receiverName: result.receiverName ?? null,
          amount: result.amount ? Number(result.amount) : null,
          content: result.content ?? null,
          initiation: result.initiation ?? null,
          service: result.service ?? null,
          currency: result.currency ?? null,
          country: result.country ?? null,
          crc: result.crc,
          issues: result.issues,
          tlv: simplify(result.nodes),
        },
        null,
        2
      ),
    [result, bank, errors.length]
  );

  const summaryText = [
    bank && `Ngân hàng: ${bank.name} (${bank.fullName})`,
    result.accountNumber && `${isCard ? 'Số thẻ' : 'Số tài khoản'}: ${result.accountNumber}`,
    result.receiverName && `Người nhận: ${result.receiverName}`,
    result.amount && `Số tiền: ${formatVND(result.amount)}`,
    result.content && `Nội dung: ${result.content}`,
  ]
    .filter(Boolean)
    .join('\n');

  const shareUrl = `${window.location.origin}/giai-ma-vietqr#q=${encodeURIComponent(result.raw)}`;

  const regenerateParams = new URLSearchParams();
  if (result.accountNumber) regenerateParams.set('account', result.accountNumber);
  if (result.amount) regenerateParams.set('amount', String(Math.floor(Number(result.amount))));
  if (result.content) regenerateParams.set('content', result.content);
  const regenerateHref = `/${bank ? bank.code.toLowerCase() : ''}?${regenerateParams}`;

  const canRender = result.isVietQr && !isCard && result.bin && result.accountNumber && /^[a-zA-Z0-9]+$/.test(result.accountNumber);
  const qrParams = new URLSearchParams({bin: result.bin ?? '', accountNumber: result.accountNumber ?? '', template: 'qr_only'});
  if (result.amount) qrParams.set('amount', String(Math.floor(Number(result.amount))));
  if (result.content) qrParams.set('addInfo', result.content);
  const qrSrc = `${API_URL}/qr/generate?${qrParams}`;

  const fixed = result.isEmv && result.nodes.length && !result.crc.valid ? fixCrc(result.raw, result.nodes) : null;
  const url = !result.isEmv && /^https?:\/\/\S+$/i.test(result.raw) ? result.raw : null;

  return (
    <div className="decode-enter space-y-6">
      <div
        role="status"
        className={cn(
          'flex items-center gap-4 rounded-2xl px-5 py-4',
          status.tone === 'green' && 'bg-emerald-500/12 text-emerald-800',
          status.tone === 'red' && 'bg-red-500/10 text-red-800',
          status.tone === 'amber' && 'bg-amber-500/15 text-amber-800'
        )}
      >
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white',
            status.tone === 'green' && 'bg-emerald-600',
            status.tone === 'red' && 'bg-red-600',
            status.tone === 'amber' && 'bg-amber-600'
          )}
        >
          {status.tone === 'green' ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <span className="text-lg font-bold">!</span>
          )}
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{status.title}</p>
          <p className="text-sm opacity-80">{status.text}</p>
        </div>
      </div>

      {!result.isEmv && (
        <div data-slot="card" className="rounded-lg border border-border bg-card p-5">
          <p className="mb-2 text-sm text-muted-foreground">Nội dung mã QR</p>
          <p className="font-mono text-sm break-all">{result.raw}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton value={result.raw} label="Sao chép" variant="outline" />
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                data-slot="button"
                data-variant="outline"
                className="inline-flex h-9 items-center rounded-lg border border-border px-3.5 text-sm font-medium"
              >
                Mở liên kết ↗
              </a>
            )}
          </div>
          {url && <p className="mt-3 text-xs text-muted-foreground">Đây là một đường link. Kiểm tra kỹ tên miền trước khi mở hoặc nhập thông tin.</p>}
        </div>
      )}

      {result.isEmv && result.nodes.length > 0 && (
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <div data-slot="card" className="rounded-lg border border-border bg-card p-5 md:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-black/5">
                {bank ? <BankImage bank={bank} className="h-full w-full" loading="eager" /> : <span className="font-mono text-xs text-neutral-500">{result.bin ?? '—'}</span>}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{bank?.name ?? (result.bin ? `BIN ${result.bin}` : 'Không rõ ngân hàng')}</p>
                <p className="truncate text-sm text-muted-foreground">{bank?.fullName ?? 'Không có trong danh sách ngân hàng'}</p>
              </div>
            </div>

            {result.accountNumber && (
              <div className="mt-5 flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{isCard ? 'Số thẻ' : 'Số tài khoản'}</p>
                  <p className="font-mono text-xl font-semibold tracking-wider break-all md:text-2xl">{result.accountNumber}</p>
                </div>
                <CopyButton value={result.accountNumber} />
              </div>
            )}

            {result.amount && (
              <div className="mt-3 rounded-xl bg-muted/50 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Số tiền</p>
                    <p className="text-2xl font-bold tabular-nums md:text-3xl">{formatVND(result.amount)}</p>
                  </div>
                  <CopyButton value={result.amount} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground italic">{amountInWords(result.amount)}</p>
              </div>
            )}

            <dl className="mt-4">
              <Row label="Nội dung" value={result.content} />
              <Row label="Người nhận" value={result.receiverName} />
              <Row label="Thành phố" value={result.city} />
              <Row label="Số hoá đơn" value={result.billNumber} mono />
              <Row label="Mã tham chiếu" value={result.referenceLabel} mono />
              <Row label="Mã cửa hàng" value={result.storeLabel} mono />
              <Row label="Mã điểm bán" value={result.terminalLabel} mono />
              <Row label="Loại mã" copy={false} value={result.initiation}>
                <span className="inline-flex flex-wrap justify-end gap-1.5">
                  {result.initiation && (
                    <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
                      {result.initiation === 'dynamic' ? 'QR động (12)' : 'QR tĩnh (11)'}
                    </span>
                  )}
                  {result.serviceLabel && <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">{result.serviceLabel}</span>}
                </span>
              </Row>
              <Row label="Tiền tệ · Quốc gia" copy={false} value={`${result.currency === '704' ? 'VND' : (result.currency ?? '—')} · ${result.country ?? '—'}`} />
              <Row label="Mã kiểm tra CRC" copy={false} value={result.crc.found ?? '—'}>
                <span className={cn('font-mono', result.crc.valid ? 'text-emerald-700' : 'text-red-700')}>
                  {result.crc.found ?? '—'} {result.crc.valid ? '✓ khớp' : `✗ cần ${result.crc.expected ?? ''}`}
                </span>
              </Row>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              {summaryText && <CopyButton value={summaryText} label="Chép thông tin" variant="outline" />}
              <CopyButton value={shareUrl} label="Chép link chia sẻ" variant="outline" />
            </div>
          </div>

          <div className="space-y-4">
            {canRender && !qrFailed && (
              <div data-slot="card" className="rounded-lg border border-border bg-card p-4">
                <p className="mb-3 text-sm font-medium">Mã QR chuẩn hoá</p>
                <div className="rounded-xl bg-white p-3 ring-1 ring-black/5">
                  <img src={qrSrc} alt="Mã QR VietQR đã chuẩn hoá" className="aspect-square w-full" onError={() => setQrFailed(true)} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Tạo lại từ dữ liệu đã giải mã, CRC đúng, quét được bằng mọi app ngân hàng.</p>
              </div>
            )}
            {result.isVietQr && (
              <Link
                to={regenerateHref}
                data-slot="button"
                data-variant="default"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold !text-primary-foreground"
              >
                Sửa & tạo lại QR với ApiPay →
              </Link>
            )}
          </div>
        </div>
      )}

      {result.issues.length > 0 && (result.isEmv || result.issues.length > 1) && (
        <div data-slot="card" className="rounded-lg border border-border bg-card p-5 md:p-6">
          <h3 className="mb-3 font-semibold">Kiểm tra chuẩn VietQR</h3>
          <ul className="space-y-2">
            {result.issues.map((issue, i) => {
              const s = ISSUE_STYLE[issue.level];
              return (
                <li key={i} className={cn('flex items-start gap-3 rounded-xl px-3.5 py-2.5 text-sm', s.box)}>
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current text-xs font-bold">
                    <span className="text-white">{s.icon}</span>
                  </span>
                  <span>
                    <span className="font-semibold">{s.label}:</span> {issue.message}
                  </span>
                </li>
              );
            })}
          </ul>
          {fixed && (
            <div className="mt-4 rounded-xl bg-muted/50 p-4">
              <p className="text-sm font-medium">Chuỗi đã sửa CRC</p>
              <p className="mt-1 font-mono text-xs break-all text-muted-foreground">{fixed}</p>
              <div className="mt-3">
                <CopyButton value={fixed} label="Chép chuỗi đã sửa" variant="outline" />
              </div>
            </div>
          )}
        </div>
      )}

      {result.isEmv && <PayloadView raw={result.raw} nodes={result.nodes} json={json} errorPaths={errorPaths} />}
    </div>
  );
}
