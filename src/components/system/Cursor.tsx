"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const FINE = "(hover: hover) and (pointer: fine)";
const subscribeFine = (cb: () => void) => {
  const mq = window.matchMedia(FINE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getFine = () => window.matchMedia(FINE).matches;
const getFineServer = () => false;

const INTERACTIVE = "a,button,[role='button'],summary,select,label[for],input[type='submit'],input[type='button']";

/**
 * Custom cursor: a small datum "+" that follows the pointer (gsap quickTo) and grows into a labelled ring over
 * [data-cursor="LABEL"] elements, and into a plain ring over links/buttons. Fine pointers only.
 * Adds `has-cursor` to <html> (globals.css hides the native cursor under it).
 */
export default function Cursor() {
  const fine = useSyncExternalStore(subscribeFine, getFine, getFineServer);
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const plus = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  // NOTE: `has-cursor` (which hides the native cursor) is only added after the custom cursor has actually
  // received a pointer move, so there is never a moment with no cursor at all.
  useEffect(() => {
    const html = document.documentElement;
    return () => html.classList.remove("has-cursor");
  }, []);

  useGSAP(
    () => {
      const el = root.current;
      const ringEl = ring.current;
      const plusEl = plus.current;
      const labelEl = label.current;
      if (!fine || !el || !ringEl || !plusEl || !labelEl) return;

      const speed = prefersReducedMotion() ? 0 : 0.35;
      gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 });
      gsap.set(ringEl, { scale: 0.2, opacity: 0 });
      gsap.set(labelEl, { opacity: 0 });
      const xTo = gsap.quickTo(el, "x", { duration: speed, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: speed, ease: "power3.out" });

      let visible = false;
      const show = (v: boolean) => {
        if (v === visible) return;
        visible = v;
        gsap.to(el, { opacity: v ? 1 : 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
        // native cursor is hidden only while the custom one is live (and restored when the pointer leaves the page)
        document.documentElement.classList.toggle("has-cursor", v);
      };

      let mode: "dot" | "ring" | "label" = "dot";
      const setMode = (next: typeof mode, text = "") => {
        if (next === "label") labelEl.textContent = text;
        if (next === mode && next !== "label") return;
        mode = next;
        const ringed = next !== "dot";
        gsap.to(ringEl, {
          scale: next === "label" ? 1 : ringed ? 0.55 : 0.2,
          opacity: ringed ? 1 : 0,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(plusEl, { scale: ringed ? 0 : 1, rotate: ringed ? 90 : 0, duration: 0.35, ease: "power2.out", overwrite: "auto" });
        gsap.to(labelEl, { opacity: next === "label" ? 1 : 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        if (!visible) {
          gsap.set(el, { x: e.clientX, y: e.clientY });
          show(true);
        }
        xTo(e.clientX);
        yTo(e.clientY);
      };
      const onOver = (e: PointerEvent) => {
        const t = e.target as Element | null;
        if (!t || !t.closest) return;
        const labelled = t.closest<HTMLElement>("[data-cursor]");
        if (labelled && labelled.dataset.cursor) return setMode("label", labelled.dataset.cursor);
        if (t.closest(INTERACTIVE)) return setMode("ring");
        setMode("dot");
      };
      const onDown = () => gsap.to(el, { scale: 0.85, duration: 0.2, ease: "power2.out", overwrite: "auto" });
      const onUp = () => gsap.to(el, { scale: 1, duration: 0.35, ease: "power2.out", overwrite: "auto" });
      const onLeave = () => show(false);
      const onEnter = () => show(true);

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerover", onOver, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      document.documentElement.addEventListener("pointerenter", onEnter);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerover", onOver);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        document.documentElement.removeEventListener("pointerenter", onEnter);
      };
    },
    // no `scope`: the cursor element does not exist until `fine` flips true after hydration, and a null scope makes GSAP warn
    { dependencies: [fine] },
  );

  if (!fine) return null;
  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[110] text-paper mix-blend-difference"
      style={{ width: 0, height: 0 }}
    >
      <span ref={plus} className="absolute left-0 top-0 block h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2">
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden style={{ maxWidth: "none" }}>
          <path d="M13 0v26M0 13h26" stroke="currentColor" strokeWidth="1.75" fill="none" />
        </svg>
        <i aria-hidden className="absolute left-1/2 top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 bg-current" />
      </span>
      <div
        ref={ring}
        className="absolute left-0 top-0 grid h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-current"
      >
        <span ref={label} className="t-label text-[0.625rem]" />
      </div>
    </div>
  );
}
