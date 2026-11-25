import {useEffect, useRef, useState} from 'react';
import {scanVideoFrame} from '../../lib/scan';

const SCAN_INTERVAL_MS = 220;

export function CameraScanner({onResult}: {onResult: (text: string) => void}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const start = async () => {
      setReady(false);
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Trình duyệt không hỗ trợ camera, hoặc trang không chạy trên HTTPS.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? {deviceId: {exact: deviceId}} : {facingMode: {ideal: 'environment'}},
          audio: false,
        });
      } catch (e) {
        const name = (e as DOMException).name;
        setError(
          name === 'NotAllowedError'
            ? 'Bạn đã chặn quyền camera. Hãy cho phép camera trong cài đặt trình duyệt rồi thử lại.'
            : name === 'NotFoundError'
              ? 'Không tìm thấy camera trên thiết bị này.'
              : 'Không mở được camera. Camera có thể đang được ứng dụng khác dùng.'
        );
        return;
      }
      if (stopped) return stream.getTracks().forEach(t => t.stop());
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setReady(true);
      navigator.mediaDevices
        .enumerateDevices()
        .then(list => !stopped && setDevices(list.filter(d => d.kind === 'videoinput')))
        .catch(() => undefined);

      canvasRef.current ??= document.createElement('canvas');
      const tick = async () => {
        if (stopped) return;
        const text = await scanVideoFrame(video, canvasRef.current!).catch(() => null);
        if (stopped) return;
        if (text) {
          navigator.vibrate?.(40);
          onResultRef.current(text);
          return;
        }
        timer = setTimeout(tick, SCAN_INTERVAL_MS);
      };
      tick();
    };

    start();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [deviceId]);

  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-black">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        {ready && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-3/5 w-3/5">
              {['left-0 top-0 border-l-4 border-t-4 rounded-tl-xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-xl', 'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-xl', 'right-0 bottom-0 border-r-4 border-b-4 rounded-br-xl'].map(c => (
                <span key={c} className={`absolute h-8 w-8 border-white ${c}`} />
              ))}
              <span className="decode-scanline absolute inset-x-2 h-0.5 rounded-full bg-white/90 shadow-[0_0_12px_2px_rgba(255,255,255,0.6)]" />
            </div>
          </div>
        )}
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">Đang mở camera…</div>
        )}
        {error && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/85">{error}</div>}
      </div>
      {devices.length > 1 && (
        <div className="flex justify-center">
          <select
            data-slot="select-trigger"
            value={deviceId}
            onChange={e => setDeviceId(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm"
            aria-label="Chọn camera"
          >
            <option value="">Camera mặc định</option>
            {devices.map((d, i) => (
              <option key={d.deviceId || i} value={d.deviceId}>
                {d.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">Đưa mã QR vào khung. Hình ảnh chỉ xử lý trên máy bạn.</p>
    </div>
  );
}
