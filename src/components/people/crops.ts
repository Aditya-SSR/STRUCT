/**
 * Tight head-and-shoulders crops of the full-length photographs, in SOURCE pixels.
 * (cx, cy) = centre of the crop, w = crop width. Height = w * ASPECT.
 * Kept deliberately tight so the SUIT-01 garment is out of frame / unreadable on this page.
 */
export const ASPECT = 1.25; // portrait 4:5

export type Crop = { cx: number; cy: number; w: number; srcW: number; srcH: number };

export const CROPS: Record<string, Crop> = {
  "suit-m-white": { cx: 468, cy: 130, w: 185, srcW: 1024, srcH: 1024 },
  "suit-f-black": { cx: 240, cy: 250, w: 320, srcW: 920, srcH: 1976 },
  "suit-m-black-a": { cx: 495, cy: 150, w: 185, srcW: 1024, srcH: 1024 },
  "suit-f-white": { cx: 518, cy: 190, w: 185, srcW: 1024, srcH: 1024 },
};

/** crop rectangle in source pixels, clamped inside the image */
export function cropRect(key: string) {
  const c = CROPS[key];
  const w = c.w;
  const h = c.w * ASPECT;
  const x = Math.min(Math.max(0, c.cx - w / 2), c.srcW - w);
  const y = Math.min(Math.max(0, c.cy - h / 2), c.srcH - h);
  return { x, y, w, h, srcW: c.srcW, srcH: c.srcH };
}
