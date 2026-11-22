import { PRODUCTS, SUIT_RELEASE, type Product } from "@/data/products";

/**
 * Real pixel sizes of the shipped .webp files (public/img/manifest.json records the source PNGs,
 * which differ for group-wide-c). Anything not listed is 1024 x 1024.
 */
const DIMS: Record<string, [number, number]> = {
  "suit-f-black": [920, 1976],
  "group-wide-a": [2400, 903],
  "group-wide-b": [2400, 903],
};

export const imgSrc = (key: string) => `/img/${key}.webp`;
export const imgDims = (key: string): [number, number] => DIMS[key] ?? [1024, 1024];

/** Gallery frame ratio: natural ratio, clamped so tall/wide outliers are cropped rather than stretched. */
export const frameRatio = (key: string) => {
  const [w, h] = imgDims(key);
  return Math.min(1.6, Math.max(0.8, w / h));
};

export const totalRemaining = () => PRODUCTS.reduce((n, p) => n + p.units.remaining, 0);
export const totalClaimed = () => SUIT_RELEASE.totalUnits - totalRemaining();

export const isLow = (p: Product) => p.units.remaining < 20;

export const fmtPrice = (p: Product) =>
  `$${p.price.usd.toLocaleString("en-US")} · ¥${p.price.jpy.toLocaleString("en-US")}`;

/** "NOIR / MEN" — the product title without the object name. */
export const variantLabel = (p: Product) => `${p.colorway.toUpperCase()} / ${p.cut.toUpperCase()}`;
