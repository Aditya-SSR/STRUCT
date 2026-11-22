/**
 * Device-class helpers for the "mobile-lite" paths (cheaper reveals, capped WebGL frame rate, static fallbacks).
 * Client-only: call from effects / event handlers, never during render (they read `window`).
 */

/** phone-sized viewport (same breakpoint the layouts use for "mobile") */
export const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

/** touch-first device up to tablet size: the "lite" tier for motion that costs main-thread time */
export const isLite = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(pointer: coarse) and (max-width: 1024px)").matches);

/**
 * A weak phone: touch-first AND (<= 4 logical cores or <= 2 GB RAM). Chrome/Android report both; Safari reports
 * neither (iPhones are fast enough), so it never lands here by accident.
 */
export function isWeakDevice(): boolean {
  if (typeof navigator === "undefined" || !isLite()) return false;
  const n = navigator as Navigator & { deviceMemory?: number };
  return (n.hardwareConcurrency > 0 && n.hardwareConcurrency <= 4) || (n.deviceMemory !== undefined && n.deviceMemory <= 2);
}

/** longest copy (characters) that still gets the per-glyph RESOLVE reveal; longer text falls back to the masked line rise */
export const resolveMaxChars = () => (isLite() ? 190 : 380);
