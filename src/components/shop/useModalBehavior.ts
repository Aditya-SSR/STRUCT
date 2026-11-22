"use client";
import { useEffect, type RefObject } from "react";
import { lockScroll, unlockScroll } from "@/lib/lenis";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * While `open`: Esc closes, Tab is trapped inside `panel`, page scroll is locked, focus moves in and is restored on close.
 * Scroll lock goes through the system agent's ref-counted `lockScroll("cart")` (Lenis stop, or overflow hidden without Lenis).
 */
export function useModalBehavior(open: boolean, panel: RefObject<HTMLElement | null>, onClose: () => void, initialFocus?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    lockScroll("cart");

    const returnTo = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => (initialFocus?.current ?? panel.current)?.focus({ preventScroll: true }));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panel.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      unlockScroll("cart");
      returnTo?.focus?.({ preventScroll: true });
    };
  }, [open, onClose, panel, initialFocus]);
}
