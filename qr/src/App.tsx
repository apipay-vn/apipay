import {useCallback, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {LogoIcon} from './components/LogoIcon';
import {QrForm, QrTemplate} from './components/QrForm';
import {QrResultModal} from './components/QrResultModal';
import {trackGenerateQr} from './lib/analytics';
import {BANKS, findBankBySlug, resolveQrBankBin} from './lib/banks';
import {API_URL, cn, useDebounce} from './lib/utils';

const MIN_ACCOUNT_NUMBER_LENGTH = 4;

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
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="https://apipay.vn" className="flex items-center gap-2">
            <LogoIcon className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold font-mono">ApiPay</span>
          </a>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a href="https://apipay.vn" className="text-muted-foreground hover:text-foreground transition-colors">
              Trang chủ
            </a>
            <a
              href="https://apipay.vn/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Giới thiệu
            </a>
          </nav>
        </div>
      </header>

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
          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Thông tin thanh toán</h2>
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
          <div className="flex gap-2 flex-wrap">
            {BANKS.map(bank => (
              <a
                key={bank.code}
                href={`/${bank.code.toLowerCase()}`}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:border-primary hover:bg-primary/5',
                  bankCode === bank.code ? 'border-primary bg-primary/10' : 'border-border bg-card'
                )}
                title={`${bank.fullName} - ${bank.code}`}
              >
                <span className="text-xs font-medium w-full text-center">
                  Tạo QR thanh toán {bank.fullName.replace(/TMCP|Thương mại cổ phần/gi, '')} - {bank.code}
                </span>
              </a>
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
          onClose={() => setIsQrModalOpen(false)}
        />
      )}
    </div>
  );
}
