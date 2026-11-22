"use client";
import { useEffect, useRef } from "react";
import { cropRect } from "./crops";
import { enqueue } from "@/lib/workQueue";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Props = {
  /** /public/img key of the full-length photograph */
  image: string;
  /** CSS custom property holding the ink colour of the dots ("--ink" on paper, "--paper" on ink) */
  color?: string;
  /** dot pitch in CSS px. Default: derived from the container width (~44 dots across, 4-9 px) */
  step?: number;
  className?: string;
};

type Field = { lum: Float32Array; lo: number; span: number };

/** one network fetch per photograph, shared by every canvas that uses it (founders grid + strip) */
const blobs = new Map<string, Promise<Blob>>();
const fetchBlob = (image: string) => {
  let p = blobs.get(image);
  if (!p) {
    p = fetch(`/img/${image}.webp`).then((r) => r.blob());
    blobs.set(image, p);
  }
  return p;
};

/** luminance fields already computed, keyed by photograph + grid size (a resize back to a known size is free) */
const fields = new Map<string, Promise<Field>>();

/**
 * Luminance field of the head-and-shoulders crop on a (cols x rows) hex grid. The crop is cut and downscaled by
 * createImageBitmap, i.e. decoded OFF the main thread; only the tiny result (~100x80 px) is read back here.
 */
function lumField(image: string, cols: number, rows: number): Promise<Field> {
  const key = `${image}|${cols}|${rows}`;
  const hit = fields.get(key);
  if (hit) return hit;
  const sw = cols * 2;
  const crop = cropRect(image);
  const job = (async () => {
    const blob = await fetchBlob(image);
    const bmp = await createImageBitmap(blob, Math.round(crop.x), Math.round(crop.y), Math.round(crop.w), Math.round(crop.h), {
      resizeWidth: sw,
      resizeHeight: rows,
      resizeQuality: "high",
    });
    const sample = document.createElement("canvas");
    sample.width = sw;
    sample.height = rows;
    const sctx = sample.getContext("2d", { willReadFrequently: true })!;
    sctx.drawImage(bmp, 0, 0);
    bmp.close();
    const data = sctx.getImageData(0, 0, sw, rows).data;

    const lum = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = clamp(c * 2 + (r & 1), 0, sw - 1);
        const i = (r * sw + px) * 4;
        lum[r * cols + c] = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      }
    }
    const sorted = Float32Array.from(lum).sort();
    const lo = sorted[Math.floor(sorted.length * 0.02)];
    const hi = sorted[Math.floor(sorted.length * 0.97)];
    return { lum, lo, span: Math.max(0.05, hi - lo) };
  })();
  fields.set(key, job);
  job.catch(() => fields.delete(key));
  return job;
}

/**
 * Dot-matrix / halftone portrait. Draws the tight head-and-shoulders crop of the photograph as a staggered
 * grid of ink dots whose radius follows luminance. Cheap by construction: nothing runs until the canvas is near
 * the viewport, the photograph is cut + downscaled off the main thread, the field is cached, drawing is queued
 * into a frame budget, and it only redraws when the box size really changed. DPR-aware. Fills its parent
 * (`relative`, aspect 4/5).
 */
export default function DotCanvas({ image, color = "--ink", step, className = "" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let alive = true;
    let drawn = { w: 0, h: 0 };
    let cancel = () => {};
    let visible = false;

    const draw = async () => {
      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;
      if (cssW < 2 || cssH < 2) return;
      if (Math.abs(cssW - drawn.w) < 2 && Math.abs(cssH - drawn.h) < 2) return;
      const g = step ?? clamp(cssW / 44, 4, 9);
      const rowH = g * 0.866; // staggered (hex) rows
      const cols = Math.ceil(cssW / g) + 1;
      const rows = Math.ceil(cssH / rowH) + 1;
      let f: Field;
      try {
        f = await lumField(image, cols, rows);
      } catch {
        return;
      }
      if (!alive) return;
      drawn = { w: cssW, h: cssH };

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = getComputedStyle(canvas).getPropertyValue(color).trim() || "#0a0a0a";
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        const y = r * rowH + rowH / 2;
        const off = r & 1 ? g / 2 : 0;
        for (let c = 0; c < cols; c++) {
          const t = clamp((f.lum[r * cols + c] - f.lo) / f.span, 0, 1);
          const rad = Math.pow(1 - t, 1.35) * g * 0.66;
          if (rad < 0.4) continue;
          const x = c * g + off;
          ctx.moveTo(x + rad, y);
          ctx.arc(x, y, rad, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    };

    let raf = 0;
    const schedule = () => {
      if (!visible) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        cancel();
        cancel = enqueue(() => void draw(), "soon");
      });
    };

    // start only when the canvas is within ~1 screen of the viewport
    const io = new IntersectionObserver(
      (entries) => {
        if (!visible && entries.some((e) => e.isIntersecting)) {
          visible = true;
          schedule();
        }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    io.observe(canvas);
    const ro = new ResizeObserver(schedule);
    ro.observe(parent);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cancel();
      io.disconnect();
      ro.disconnect();
    };
  }, [image, color, step]);

  return <canvas ref={ref} aria-hidden className={`absolute inset-0 h-full w-full ${className}`} />;
}
