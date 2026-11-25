import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {DecodeFaq} from '../components/decode/DecodeFaq';
import {DecodeInput, type DecodeSource, type InputMode} from '../components/decode/DecodeInput';
import {DecodeResult} from '../components/decode/DecodeResult';
import {SiteHeader} from '../components/SiteHeader';
import {trackDecodeQr} from '../lib/analytics';
import {BANKS} from '../lib/banks';
import {scanImage} from '../lib/scan';
import {formatVND} from '../lib/utils';
import {decodeQr} from '../lib/vietqr';

const TITLE = 'Giải Mã QR VietQR Miễn Phí - Đọc Số Tài Khoản, Số Tiền, Kiểm Tra CRC | ApiPay';
const DESCRIPTION =
  'Giải mã mã QR VietQR miễn phí: đọc ngân hàng, số tài khoản, số tiền, nội dung chuyển khoản, kiểm tra CRC và sửa lỗi. Dán ảnh, quét camera hoặc dán chuỗi. Không tải ảnh lên máy chủ.';
const HISTORY_KEY = 'apipay-qr-decode-history';
const HISTORY_MAX = 8;
const BINS = new Set(BANKS.map(b => b.bin));

function readHistory(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string').slice(0, HISTORY_MAX) : [];
  } catch {
    return [];
  }
}

function writeHistory(list: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // Storage blocked (private mode); history is a convenience only.
  }
}

function usePageMeta() {
  useLayoutEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prev = {title: document.title, description: meta?.content, canonical: canonical?.href};
    document.title = TITLE;
    meta?.setAttribute('content', DESCRIPTION);
    canonical?.setAttribute('href', 'https://qr.apipay.vn/giai-ma-vietqr');
    return () => {
      document.title = prev.title;
      if (prev.description) meta?.setAttribute('content', prev.description);
      if (prev.canonical) canonical?.setAttribute('href', prev.canonical);
    };
  }, []);
}

export default function DecodePage() {
  usePageMeta();
  const [mode, setMode] = useState<InputMode>('image');
  const [text, setText] = useState('');
  const [payload, setPayload] = useState('');
  const [scanning, setScanning] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(readHistory);
  const resultRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => (payload.trim() ? decodeQr(payload, BINS) : null), [payload]);
  const bank = result?.bin ? BANKS.find(b => b.bin === result.bin) : undefined;

  const remember = useCallback((raw: string) => {
    setHistory(prev => {
      const next = [raw, ...prev.filter(p => p !== raw)].slice(0, HISTORY_MAX);
      writeHistory(next);
      return next;
    });
  }, []);

  const decode = useCallback(
    (raw: string, source: DecodeSource, scroll = true) => {
      const clean = raw.trim();
      if (!clean) return;
      setPayload(clean);
      setText(clean);
      const decoded = decodeQr(clean, BINS);
      if (decoded.isEmv) remember(clean);
      trackDecodeQr(source, decoded.isVietQr && !decoded.issues.some(i => i.level === 'error'));
      if (source === 'camera') setMode('text');
      if (source !== 'link' && window.location.hash) window.history.replaceState(null, '', window.location.pathname);
      if (scroll) requestAnimationFrame(() => resultRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'}));
    },
    [remember]
  );

  const onImage = useCallback(
    async (blob: Blob, source: DecodeSource = 'image') => {
      setMode('image');
      setImageError(null);
      setScanning(true);
      setImageUrl(URL.createObjectURL(blob));
      try {
        const found = await scanImage(blob);
        if (found) decode(found, source);
        else setImageError('Không tìm thấy mã QR. Thử ảnh rõ hơn, cắt sát mã QR, hoặc dùng camera.');
      } catch {
        setImageError('Không mở được ảnh này. Hãy thử ảnh PNG hoặc JPG khác.');
      } finally {
        setScanning(false);
      }
    },
    [decode]
  );

  // Paste an image or a payload anywhere on the page; typing in a field keeps its own paste.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const image = items.find(i => i.type.startsWith('image/'))?.getAsFile();
      if (image) {
        e.preventDefault();
        onImage(image, 'paste');
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      const pasted = e.clipboardData?.getData('text/plain');
      if (pasted?.trim()) {
        e.preventDefault();
        decode(pasted, 'paste');
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [decode, onImage]);

  // Shared links carry the payload in the hash so it never reaches a server.
  useEffect(() => {
    const fromHash = () => {
      const q = new URLSearchParams(window.location.hash.slice(1)).get('q');
      if (q) decode(q, 'link', false);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [decode]);

  useEffect(() => () => void (imageUrl && URL.revokeObjectURL(imageUrl)), [imageUrl]);

  const onTextChange = (value: string) => {
    setText(value);
    setPayload(value);
  };

  useEffect(() => {
    if (mode !== 'text' || !text.trim()) return;
    const timer = setTimeout(() => decodeQr(text, BINS).isEmv && remember(text.trim()), 1200);
    return () => clearTimeout(timer);
  }, [mode, text, remember]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Miễn phí · Không giới hạn · Không tải ảnh lên máy chủ
          </span>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-balance md:text-5xl">Giải mã QR VietQR</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-balance">
            Đọc ngân hàng, số tài khoản, số tiền và nội dung từ mọi mã QR chuyển khoản. Kiểm tra mã có đúng chuẩn NAPAS không và sửa lỗi CRC trong một
            cú nhấp.
          </p>
        </div>

        <DecodeInput
          mode={mode}
          onModeChange={setMode}
          text={text}
          onTextChange={onTextChange}
          onImage={onImage}
          onDecode={decode}
          scanning={scanning}
          imageUrl={imageUrl}
          imageError={imageError}
        />

        <div ref={resultRef} className="scroll-mt-6">
          {result && (
            <div className="mt-8">
              <DecodeResult key={result.raw} result={result} bank={bank} />
            </div>
          )}
        </div>

        {history.length > 0 && (
          <section className="mt-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground">Đã giải mã gần đây (chỉ lưu trên máy này)</h2>
              <button
                type="button"
                onClick={() => {
                  setHistory([]);
                  writeHistory([]);
                }}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Xoá lịch sử
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {history.map(raw => {
                const d = decodeQr(raw, BINS);
                const b = d.bin ? BANKS.find(x => x.bin === d.bin) : undefined;
                return (
                  <button
                    key={raw}
                    type="button"
                    data-slot="button"
                    data-variant="outline"
                    onClick={() => decode(raw, 'history')}
                    className="flex shrink-0 flex-col items-start rounded-xl border border-border px-3.5 py-2 text-left transition-colors hover:bg-muted"
                  >
                    <span className="text-sm font-semibold">{b?.name ?? (d.bin ? `BIN ${d.bin}` : 'QR EMVCo')}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {d.accountNumber ?? '—'}
                      {d.amount ? ` · ${formatVND(d.amount)}` : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-16">
          <DecodeFaq />
        </div>
      </main>

      <footer className="mt-12 border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} ApiPay JSC</div>
      </footer>
    </div>
  );
}
