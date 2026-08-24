export type AmbientTriple = [string, string, string];

const DEFAULT_AMBIENT: AmbientTriple = ["#C4762E", "#7A3B33", "#251C20"];

function toHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function averageRegion(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const startX = Math.floor(x0 * width);
  const endX = Math.max(startX + 1, Math.floor(x1 * width));
  const startY = Math.floor(y0 * height);
  const endY = Math.max(startY + 1, Math.floor(y1 * height));

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const i = (y * width + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  if (n === 0) return toHex(0, 0, 0);
  return toHex(r / n, g / n, b / n);
}

/** Samples three regional average colors from a downsized frame — one per gradient anchor. */
export function sampleAmbientFromVideo(video: HTMLVideoElement, canvas: HTMLCanvasElement): AmbientTriple | null {
  const W = 32;
  const H = 18;
  if (video.videoWidth === 0 || video.videoHeight === 0) return null;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  return [
    averageRegion(data, W, H, 0, 0, 0.4, 0.4),
    averageRegion(data, W, H, 0.3, 0.2, 0.8, 0.7),
    averageRegion(data, W, H, 0.6, 0.6, 1, 1),
  ];
}

function hashIdentity(identity: string) {
  let h = 0;
  for (let i = 0; i < identity.length; i++) h = (h * 31 + identity.charCodeAt(i)) >>> 0;
  return h;
}

function hslToHex(h: number, s: number, l: number) {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toChannel = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toChannel(f(0))}${toChannel(f(8))}${toChannel(f(4))}`;
}

/** Derives a deterministic warm/cool triad from an identity string, used to tint the ambient light while they speak. */
export function ambientFromIdentity(identity: string): AmbientTriple {
  const hue = hashIdentity(identity) % 360;
  return [hslToHex(hue, 55, 45), hslToHex(hue, 45, 28), hslToHex(hue, 35, 14)];
}

export function defaultAmbient(): AmbientTriple {
  return DEFAULT_AMBIENT;
}
