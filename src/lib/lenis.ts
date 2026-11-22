import type Lenis from "lenis";

/**
 * Lenis registry + scroll lock.
 * `getLenis()` returns the live instance (null on the server, and when reduced motion disables smoothing).
 * `lockScroll(key)` / `unlockScroll(key)` are reference-counted by key so the preloader, the menu and the cart
 * can each hold the lock independently. Works with or without Lenis.
 */
let instance: Lenis | null = null;
const locks = new Set<string>();

function apply() {
  if (typeof document === "undefined") return;
  const locked = locks.size > 0;
  if (instance) {
    if (locked) instance.stop();
    else instance.start();
    document.documentElement.style.overflow = "";
  } else {
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }
}

export const getLenis = () => instance;

export function setLenis(l: Lenis | null) {
  instance = l;
  apply();
}

export function lockScroll(key: string) {
  locks.add(key);
  apply();
}

export function unlockScroll(key: string) {
  locks.delete(key);
  apply();
}

/** Jump to the top without animation (used by page transitions). */
export function scrollToTop() {
  if (typeof window === "undefined") return;
  instance?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}
