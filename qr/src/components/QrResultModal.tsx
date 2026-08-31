import {useEffect, useState} from 'react';

interface QrResultModalProps {
  qrUrl: string;
  bankCode: string;
  accountNumber: string;
  amount: string;
  onClose: () => void;
}

export function QrResultModal({qrUrl, bankCode, accountNumber, onClose}: QrResultModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    setImageLoaded(false);
    setDownloadError(null);
  }, [qrUrl]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const downloadFilename = `apipay-${bankCode || 'qr'}-${accountNumber.trim() || 'account'}.png`;

  const getDownloadUrl = () => {
    if (!qrUrl) return null;
    const url = new URL(qrUrl);
    url.searchParams.set('download', '1');
    return url.toString();
  };

  const triggerDirectDownload = (downloadUrl: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = downloadFilename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadQr = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(qrUrl, {cache: 'no-store'});
      if (!response.ok) throw new Error('Failed to download QR image');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: use direct download URL with ?download=1 (Content-Disposition: attachment)
      const downloadUrl = getDownloadUrl();
      if (downloadUrl) {
        try {
          triggerDirectDownload(downloadUrl);
        } catch {
          setDownloadError('Không thể tải PNG. Bạn vẫn có thể mở URL để lưu ảnh.');
        }
      } else {
        setDownloadError('Không thể tải PNG. Bạn vẫn có thể mở URL để lưu ảnh.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const openUrl = () => {
    window.open(qrUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-result-title"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 id="qr-result-title" className="text-lg font-semibold">
              Mã QR đã sẵn sàng
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Tải PNG hoặc mở link ảnh khi cần chia sẻ trực tiếp.</p>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="relative flex min-h-[292px] items-center justify-center rounded-md bg-white">
              {!imageLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
                  Đang tải mã QR
                </div>
              )}
              <img
                src={qrUrl}
                alt="Mã QR VietQR"
                className="max-h-[292px] w-full object-contain"
                loading="eager"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>

          {downloadError && <p className="text-sm text-red-600">{downloadError}</p>}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={downloadQr}
              disabled={isDownloading}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {isDownloading ? 'Đang tải' : 'Download'}
            </button>
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              onClick={openUrl}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-6 0L20 6m0 0h-5m5 0v5"
                />
              </svg>
              Open URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
