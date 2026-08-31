import {useState} from 'react';
import {cn} from '../lib/utils';

interface QrPreviewProps {
  qrUrl: string | null;
  accountNumber: string;
}

export function QrPreview({qrUrl, accountNumber}: QrPreviewProps) {
  const [copied, setCopied] = useState(false);

  const copyEmbedCode = () => {
    if (!qrUrl) return;
    const embedCode = `<img src="${qrUrl}" alt="VietQR" />`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    // Use ?download=1 so the server sends Content-Disposition: attachment
    const url = new URL(qrUrl);
    url.searchParams.set('download', '1');
    const link = document.createElement('a');
    link.href = url.toString();
    link.download = `apipay-${accountNumber}.png`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!qrUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </div>
        <p className="text-muted-foreground max-w-xs">Nhập thông tin và nhấn "Tạo QR Code" để tạo mã QR thanh toán</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* QR Display */}
      <div className="flex justify-center">
        <div className="relative rounded-xl overflow-hidden bg-white p-4 shadow-lg">
          <img src={qrUrl} alt="VietQR Code" className="w-56 h-56 object-contain" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={downloadQR}
          className="flex-1 h-11 border border-border rounded-lg flex items-center justify-center gap-2 hover:bg-muted transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span className="text-sm font-medium">Tải về</span>
        </button>
        <button
          onClick={copyEmbedCode}
          className={cn(
            'flex-1 h-11 border border-border rounded-lg flex items-center justify-center gap-2 hover:bg-muted transition-colors',
            copied && 'bg-green-50 border-green-200'
          )}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-green-600">Đã sao chép</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">Sao chép code</span>
            </>
          )}
        </button>
      </div>

      {/* Embed Code */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Nhúng vào website</label>
        <div className="p-3 rounded-lg bg-neutral-900 dark:bg-neutral-950 border border-neutral-800 overflow-x-auto">
          <code className="text-xs text-neutral-100 whitespace-pre-wrap break-all">
            {`<img src="${qrUrl}" alt="VietQR" />`}
          </code>
        </div>
      </div>
    </div>
  );
}
