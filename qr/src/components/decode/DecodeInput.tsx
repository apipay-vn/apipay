import {useRef, useState} from 'react';
import {cn} from '../../lib/utils';
import {CameraScanner} from './CameraScanner';

export type DecodeSource = 'image' | 'paste' | 'camera' | 'text' | 'sample' | 'link' | 'history';
export type InputMode = 'image' | 'camera' | 'text';

export const SAMPLES = [
  {
    label: 'QR tĩnh',
    payload: '00020101021138540010A00000072701240006970422011001234567890208QRIBFTTA53037045802VN5914CONG TY APIPAY6006HA NOI63044444',
  },
  {
    label: 'QR có số tiền',
    payload: '00020101021238540010A00000072701240006970436011010123456780208QRIBFTTA530370454061500005802VN62170813APIPAY DH10246304F807',
  },
  {
    label: 'QR lỗi CRC',
    payload:
      '00020101021238580010A000000727012800069704070114190345678901230208QRIBFTTA5303704540725000005802VN62200816HOC PHI THANG 1163041A2B',
  },
];

const MODES: {value: InputMode; label: string}[] = [
  {value: 'image', label: 'Ảnh QR'},
  {value: 'camera', label: 'Camera'},
  {value: 'text', label: 'Dán chuỗi'},
];

interface DecodeInputProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  text: string;
  onTextChange: (text: string) => void;
  onImage: (file: Blob) => void;
  onDecode: (text: string, source: DecodeSource) => void;
  scanning: boolean;
  imageUrl: string | null;
  imageError: string | null;
}

export function DecodeInput({mode, onModeChange, text, onTextChange, onImage, onDecode, scanning, imageUrl, imageError}: DecodeInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
    if (file) return onImage(file);
    const dropped = e.dataTransfer.getData('text/plain');
    if (dropped) onDecode(dropped, 'text');
  };

  return (
    <div data-slot="card" className="rounded-lg border border-border bg-card p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div data-slot="tabs-list" role="tablist" className="inline-flex rounded-lg bg-muted p-1">
          {MODES.map(m => (
            <button
              key={m.value}
              type="button"
              role="tab"
              aria-selected={mode === m.value}
              data-slot="tabs-trigger"
              data-state={mode === m.value ? 'active' : 'inactive'}
              onClick={() => onModeChange(m.value)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                mode === m.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Mẹo: nhấn <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px]">{isMac ? '⌘' : 'Ctrl'}+V</kbd> ở bất kỳ đâu để dán ảnh
          chụp màn hình
        </p>
      </div>

      {mode === 'image' && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Chọn hoặc kéo thả ảnh mã QR"
          onClick={() => fileRef.current?.click()}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), fileRef.current?.click())}
          onDragOver={e => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'group relative flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-6 text-center transition-all',
            dragging ? 'scale-[1.01] border-foreground/60 bg-foreground/5' : 'border-border hover:border-foreground/30 hover:bg-foreground/[0.02]'
          )}
        >
          {imageUrl ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
              <div className="relative h-36 w-36 overflow-hidden rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
                <img src={imageUrl} alt="Ảnh QR đã chọn" className="h-full w-full object-contain" />
                {scanning && <div className="decode-scanline absolute inset-x-2 h-0.5 rounded-full bg-foreground/70" />}
              </div>
              <div className="text-center sm:text-left">
                <p className="font-medium">{scanning ? 'Đang đọc mã QR…' : imageError ? 'Không đọc được mã' : 'Đã đọc xong'}</p>
                {imageError && <p className="mt-1 max-w-xs text-sm text-destructive">{imageError}</p>}
                <p className="mt-2 text-sm text-muted-foreground underline-offset-4 group-hover:underline">Chọn ảnh khác</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg transition-transform group-hover:-translate-y-0.5">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                  <rect x="7" y="7" width="4" height="4" rx="0.5" />
                  <rect x="13" y="7" width="4" height="4" rx="0.5" />
                  <rect x="7" y="13" width="4" height="4" rx="0.5" />
                  <path d="M13 13h1.5v1.5M17 13v4h-4" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold">{dragging ? 'Thả ảnh vào đây' : 'Kéo thả ảnh QR, hoặc bấm để chọn'}</p>
                <p className="mt-1 text-sm text-muted-foreground">PNG, JPG, WEBP, ảnh chụp màn hình app ngân hàng, hoá đơn…</p>
              </div>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) onImage(file);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {mode === 'camera' && <CameraScanner onResult={t => onDecode(t, 'camera')} />}

      {mode === 'text' && (
        <div className="space-y-2">
          <textarea
            data-slot="textarea"
            value={text}
            onChange={e => onTextChange(e.target.value)}
            rows={4}
            spellCheck={false}
            autoFocus
            placeholder="Dán chuỗi VietQR, ví dụ 00020101021238…6304ABCD"
            className="w-full resize-y rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm leading-relaxed break-all outline-none focus:ring-2 focus:ring-ring/30"
          />
          <p className="text-xs text-muted-foreground">Kết quả hiện ngay khi bạn dán hoặc sửa chuỗi.</p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Thử mẫu:</span>
        {SAMPLES.map(s => (
          <button
            key={s.label}
            type="button"
            data-slot="button"
            data-variant="outline"
            onClick={() => onDecode(s.payload, 'sample')}
            className="rounded-lg border border-border px-3 py-1 text-sm font-medium transition-colors hover:bg-muted"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
