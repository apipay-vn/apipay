interface NativeDetector {
  detect(source: CanvasImageSource): Promise<{rawValue: string}[]>;
}

let detectorPromise: Promise<NativeDetector | null> | null = null;

function nativeDetector(): Promise<NativeDetector | null> {
  detectorPromise ??= (async () => {
    const Ctor = (window as unknown as {BarcodeDetector?: {new (o: {formats: string[]}): NativeDetector; getSupportedFormats(): Promise<string[]>}})
      .BarcodeDetector;
    if (!Ctor) return null;
    try {
      const formats = await Ctor.getSupportedFormats();
      return formats.includes('qr_code') ? new Ctor({formats: ['qr_code']}) : null;
    } catch {
      return null;
    }
  })();
  return detectorPromise;
}

async function decodeCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
  const native = await nativeDetector();
  if (native) {
    try {
      const found = await native.detect(canvas);
      if (found[0]?.rawValue) return found[0].rawValue;
    } catch {
      // Fall through to jsQR.
    }
  }
  const {default: jsQR} = await import('jsqr');
  const ctx = canvas.getContext('2d', {willReadFrequently: true});
  if (!ctx) return null;
  const {data, width, height} = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(data, width, height, {inversionAttempts: 'attemptBoth'})?.data ?? null;
}

function draw(source: CanvasImageSource, width: number, height: number, maxSide: number, canvas = document.createElement('canvas')) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d', {willReadFrequently: true})!;
  // Transparent PNGs decode as black-on-black without a white base.
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function scanImage(blob: Blob): Promise<string | null> {
  const bitmap = await createImageBitmap(blob);
  try {
    // Large screenshots hold small codes; small ones decode better downscaled.
    for (const side of [1600, 2800, 800]) {
      if (side > 1600 && Math.max(bitmap.width, bitmap.height) <= 1600) continue;
      const result = await decodeCanvas(draw(bitmap, bitmap.width, bitmap.height, side));
      if (result) return result;
    }
    return null;
  } finally {
    bitmap.close();
  }
}

export async function scanVideoFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<string | null> {
  if (!video.videoWidth) return null;
  return decodeCanvas(draw(video, video.videoWidth, video.videoHeight, 720, canvas));
}
