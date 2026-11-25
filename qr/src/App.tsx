import {useCallback, useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {QrForm, QrTemplate} from './components/QrForm';
import {QrResultModal} from './components/QrResultModal';
import {SiteHeader} from './components/SiteHeader';
import {trackGenerateQr} from './lib/analytics';
import {BANKS, findBankBySlug, resolveQrBankBin} from './lib/banks';
import {scanImage} from './lib/scan';
import {API_URL, cn, formatVND, useDebounce} from './lib/utils';
import {SERVICE_CARD, decodeQr} from './lib/vietqr';

const MIN_ACCOUNT_NUMBER_LENGTH = 4;
const BINS = new Set(BANKS.map(b => b.bin));
const HISTORY_KEY = 'apipay-qr-generate-history';
const HISTORY_MAX = 6;

interface Recent {
  bankCode: string;
  accountNumber: string;
  amount: string;
  content: string;
  accountName: string;
}

function readHistory(): Recent[] {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (!Array.isArray(list)) return [];
    return list
      .filter(x => typeof x?.bankCode === 'string' && typeof x?.accountNumber === 'string')
      .slice(0, HISTORY_MAX)
      .map(x => ({
        bankCode: x.bankCode,
        accountNumber: x.accountNumber,
        amount: String(x.amount ?? ''),
        content: String(x.content ?? ''),
        accountName: String(x.accountName ?? ''),
      }));
  } catch {
    return [];
  }
}

function writeHistory(list: Recent[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // Storage blocked (private mode); history is a convenience only.
  }
}

export default function App() {
  const {slug} = useParams<{slug?: string}>();
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [content, setContent] = useState('');
  const [accountName, setAccountName] = useState('');
  const [template, setTemplate] = useState<QrTemplate>('trademark');
  const [errors, setErrors] = useState<{bank?: string; account?: string}>({});

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [history, setHistory] = useState<Recent[]>(readHistory);
  const [fillNote, setFillNote] = useState<{tone: 'busy' | 'ok' | 'warn'; text: string} | null>(null);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  const buildQrUrl = useCallback(() => {
    const bin = resolveQrBankBin(bankCode);
    const trimmedAccountNumber = accountNumber.trim();
    if (!bin || trimmedAccountNumber.length < MIN_ACCOUNT_NUMBER_LENGTH) return null;
    let url = `${API_URL}/qr/generate?bin=${bin}&accountNumber=${trimmedAccountNumber}&template=${template}`;
    const params: string[] = [];
    if (amount.trim()) params.push(`amount=${encodeURIComponent(amount)}`);
    if (content.trim()) params.push(`addInfo=${encodeURIComponent(content)}`);
    const trimmedName = accountName.trim();
    if (trimmedName) params.push(`accountName=${encodeURIComponent(trimmedName)}`);
    if (params.length > 0) url += `&${params.join('&')}`;
    return url;
  }, [bankCode, accountNumber, amount, content, accountName, template]);

  const generateQrUrl = useCallback(() => {
    setQrUrl(buildQrUrl());
  }, [buildQrUrl]);

  const debouncedGenerateQr = useDebounce(generateQrUrl, 500);

  // Debounced QR generation when bank + account are filled
  useEffect(() => {
    if (bankCode && accountNumber.trim().length >= MIN_ACCOUNT_NUMBER_LENGTH) {
      debouncedGenerateQr();
    } else {
      setQrUrl(null);
      setIsQrModalOpen(false);
    }
  }, [bankCode, accountNumber, amount, content, accountName, template, debouncedGenerateQr]);

  const fillFromQr = useCallback((raw: string) => {
    const d = decodeQr(raw.trim(), BINS);
    if (!d.isVietQr || !d.accountNumber || d.service === SERVICE_CARD) {
      setFillNote({tone: 'warn', text: 'Đây không phải mã VietQR chuyển khoản tới số tài khoản.'});
      return;
    }
    const bank = BANKS.find(b => b.bin === d.bin);
    const amountDigits = d.amount ? String(Math.floor(Number(d.amount))) : '';
    setBankCode(bank?.code ?? '');
    setAccountNumber(d.accountNumber);
    setAmount(amountDigits === '0' ? '' : amountDigits);
    setContent(d.content ?? '');
    setAccountName(d.receiverName ?? '');
    setErrors({});
    const filled = [bank?.name, 'số tài khoản', amountDigits && amountDigits !== '0' && 'số tiền', d.content && 'nội dung', d.receiverName && 'tên chủ TK'];
    const missingBank = bank ? '' : ` Ngân hàng BIN ${d.bin} chưa có trong danh sách, hãy chọn tay.`;
    setFillNote({tone: bank ? 'ok' : 'warn', text: `Đã điền từ mã QR: ${filled.filter(Boolean).join(', ')}.${missingBank}`});
  }, []);

  const fillFromImage = useCallback(
    async (blob: Blob) => {
      setFillNote({tone: 'busy', text: 'Đang đọc ảnh QR…'});
      try {
        const found = await scanImage(blob);
        if (found) fillFromQr(found);
        else setFillNote({tone: 'warn', text: 'Không tìm thấy mã QR trong ảnh. Thử ảnh rõ hơn hoặc cắt sát mã QR.'});
      } catch {
        setFillNote({tone: 'warn', text: 'Không mở được ảnh này. Hãy thử ảnh PNG hoặc JPG khác.'});
      }
    },
    [fillFromQr]
  );

  // Paste or drop a QR image/payload anywhere; text pasted into a field stays in that field.
  useEffect(() => {
    const isField = (target: EventTarget | null) => !!(target as HTMLElement | null)?.closest?.('input, textarea, [contenteditable="true"]');
    const onPaste = (e: ClipboardEvent) => {
      const image = Array.from(e.clipboardData?.items ?? []).find(i => i.type.startsWith('image/'))?.getAsFile();
      if (image) {
        e.preventDefault();
        fillFromImage(image);
        return;
      }
      const text = e.clipboardData?.getData('text/plain');
      if (isField(e.target) || !text?.trim()) return;
      e.preventDefault();
      fillFromQr(text);
    };
    const onDragOver = (e: DragEvent) => e.preventDefault();
    const onDrop = (e: DragEvent) => {
      const file = Array.from(e.dataTransfer?.files ?? []).find(f => f.type.startsWith('image/'));
      if (file) {
        e.preventDefault();
        fillFromImage(file);
        return;
      }
      if (e.dataTransfer?.types.includes('Files')) return e.preventDefault();
      const text = e.dataTransfer?.getData('text/plain');
      if (isField(e.target) || !text?.trim()) return;
      e.preventDefault();
      fillFromQr(text);
    };
    document.addEventListener('paste', onPaste);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    return () => {
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
    };
  }, [fillFromQr, fillFromImage]);

  const remember = (entry: Recent) => {
    setHistory(prev => {
      const key = JSON.stringify(entry);
      const next = [entry, ...prev.filter(p => JSON.stringify(p) !== key)].slice(0, HISTORY_MAX);
      writeHistory(next);
      return next;
    });
  };

  const refill = (entry: Recent) => {
    setBankCode(entry.bankCode);
    setAccountNumber(entry.accountNumber);
    setAmount(entry.amount);
    setContent(entry.content);
    setAccountName(entry.accountName);
    setErrors({});
    setFillNote(null);
  };

  // Prefill from the decoder's "regenerate" link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillAmount = params.get('amount');
    setAccountNumber(prev => params.get('account') ?? prev);
    if (prefillAmount && /^\d+$/.test(prefillAmount)) setAmount(prefillAmount);
    setContent(prev => params.get('content') ?? prev);
  }, []);

  // Prefill bank from URL slug
  useEffect(() => {
    const bank = findBankBySlug(slug);
    if (bank) {
      setBankCode(bank.code);
    }
  }, [slug]);

  const handleSubmit = () => {
    const newErrors: {bank?: string; account?: string} = {};
    if (!bankCode) newErrors.bank = 'Vui lòng chọn ngân hàng';
    if (!accountNumber.trim()) newErrors.account = 'Vui lòng nhập số tài khoản';
    if (accountNumber.trim() && accountNumber.trim().length < MIN_ACCOUNT_NUMBER_LENGTH) {
      newErrors.account = 'Số tài khoản phải có ít nhất 4 ký tự';
    }
    setErrors(newErrors);

    const nextQrUrl = buildQrUrl();
    if (Object.keys(newErrors).length === 0 && nextQrUrl) {
      setQrUrl(nextQrUrl);
      setIsQrModalOpen(true);
      trackGenerateQr(bankCode);
      remember({bankCode, accountNumber: accountNumber.trim(), amount, content: content.trim(), accountName: accountName.trim()});
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Tạo QR Thanh Toán - VietQR</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Công cụ tạo mã QR thanh toán chuẩn VietQR miễn phí. Nhanh chóng, an toàn và hỗ trợ tất cả ngân hàng Việt
            Nam.
          </p>
        </div>
        {/* Form and Preview */}
        <div className="grid md:grid-cols-1 gap-8">
          {/* Form */}
          <div data-slot="card" className="rounded-lg border border-border bg-card p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">Thông tin thanh toán</h2>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Dán ảnh QR để điền nhanh{' '}
                <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px]">{isMac ? '⌘' : 'Ctrl'}+V</kbd>
              </p>
            </div>
            {fillNote && (
              <p
                role="status"
                className={cn(
                  'decode-enter mb-5 rounded-xl px-4 py-2.5 text-sm',
                  fillNote.tone === 'ok' && 'bg-emerald-500/12 text-emerald-800',
                  fillNote.tone === 'warn' && 'bg-amber-500/15 text-amber-800',
                  fillNote.tone === 'busy' && 'bg-muted text-muted-foreground'
                )}
              >
                {fillNote.text}
              </p>
            )}
            <QrForm
              bankCode={bankCode}
              accountNumber={accountNumber}
              amount={amount}
              content={content}
              accountName={accountName}
              template={template}
              onBankChange={setBankCode}
              onAccountChange={setAccountNumber}
              onAmountChange={setAmount}
              onContentChange={setContent}
              onAccountNameChange={setAccountName}
              onTemplateChange={setTemplate}
              onSubmit={handleSubmit}
              errors={errors}
            />
          </div>

          {history.length > 0 && (
            <section className="min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground">Đã tạo gần đây (chỉ lưu trên máy này)</h2>
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
                {history.map(entry => (
                  <button
                    key={JSON.stringify(entry)}
                    type="button"
                    data-slot="button"
                    data-variant="outline"
                    onClick={() => refill(entry)}
                    className="flex shrink-0 flex-col items-start rounded-xl border border-border px-3.5 py-2 text-left transition-colors hover:bg-muted"
                  >
                    <span className="text-sm font-semibold">{BANKS.find(b => b.code === entry.bankCode)?.name ?? entry.bankCode}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {entry.accountNumber}
                      {entry.amount ? ` · ${formatVND(entry.amount)}` : ''}
                    </span>
                    {entry.content && <span className="max-w-48 truncate text-xs text-muted-foreground">{entry.content}</span>}
                  </button>
                ))}
              </div>
            </section>
          )}

          {qrUrl && <img src={qrUrl} loading="eager" className="h-0 w-0" alt="" aria-hidden="true" />}

          {/* Preview */}
          {/* <div ref={previewRef} className="rounded-lg border border-border bg-card p-6 md:p-8 scroll-mt-6">
            <h2 className="text-xl font-semibold mb-6">Kết quả</h2>
            <QrPreview qrUrl={qrUrl} accountNumber={accountNumber} />
          </div> */}
        </div>

        {/* Bank Quick-Select */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mt-8 mb-4 text-center">Tạo QR thanh toán qua các ngân hàng</h2>
          <div data-slot="card" className="flex gap-2 flex-wrap rounded-lg p-4">
            {BANKS.map(bank => (
              <Link
                key={bank.code}
                to={`/${bank.code.toLowerCase()}`}
                onClick={() => {
                  setBankCode(bank.code);
                  window.scrollTo({top: 0});
                }}
                data-slot="button"
                data-variant={bankCode === bank.code ? 'default' : 'outline'}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg',
                  bankCode === bank.code ? 'bg-primary text-primary-foreground' : 'bg-card'
                )}
                title={`${bank.fullName} - ${bank.code}`}
              >
                <span className="text-xs font-medium w-full text-center">
                  Tạo QR thanh toán {bank.fullName.replace(/TMCP|Thương mại cổ phần/gi, '')} - {bank.code}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ApiPay JSC
        </div>
      </footer>

      {qrUrl && isQrModalOpen && (
        <QrResultModal
          qrUrl={qrUrl}
          bankCode={bankCode}
          accountNumber={accountNumber.trim()}
          amount={amount}
          content={content}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}
    </div>
  );
}
