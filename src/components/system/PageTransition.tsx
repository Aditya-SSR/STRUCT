"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { scrollToTop } from "@/lib/lenis";
import { useUI } from "@/store/ui";
import { registerNavigator, type NavOpts } from "./transitionBus";
import { labelFor } from "./nav";

const STRIPS = 5;
const HARD_TIMEOUT = 22000; // nothing may ever stay covered longer than this
const ROUTE_TIMEOUT = 12000; // dev compiles can be slow; wait for the new pathname this long

const frames = (n: number) =>
  new Promise<void>((res) => {
    const step = (k: number) => (k <= 0 ? res() : requestAnimationFrame(() => step(k - 1)));
    step(n);
  });

/**
 * Page transition: 5 ink strips wipe up (resolve ease) with the destination label in Bitcount,
 * router.push mid-cover, wait for the new pathname, jump to top, strips wipe off.
 * Wraps {children}; also hosts the cover overlay (z-90: above menu/header, below preloader/cursor).
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);
  const pathRef = useRef(pathname);
  const waiter = useRef<((p: string) => void) | null>(null);

  // pathname bookkeeping + settle for navigations we did not trigger (back/forward, programmatic)
  useEffect(() => {
    pathRef.current = pathname;
    waiter.current?.(pathname);
    if (busy.current) return;
    const ui = useUI.getState();
    ui.setMenuOpen(false);
    ui.setCartOpen(false);
    const t = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => clearTimeout(t);
  }, [pathname]);

  useGSAP(
    (_ctx, contextSafe) => {
      const el = root.current;
      if (!el || !contextSafe) return;
      const strips = gsap.utils.toArray<HTMLElement>("[data-strip]", el);
      const mark = el.querySelector<HTMLElement>("[data-mark]");
      const rule = el.querySelector<HTMLElement>("[data-rule]");
      const lab = label.current;
      if (!mark || !rule || !lab) return;

      const reset = () => {
        gsap.killTweensOf([...strips, lab, rule, mark]);
        gsap.set(strips, { yPercent: 100 });
        gsap.set(lab, { yPercent: 115 });
        gsap.set(rule, { scaleX: 0, opacity: 1 });
        gsap.set(mark, { scale: 0, opacity: 1 });
        gsap.set(el, { visibility: "hidden", pointerEvents: "none" });
      };
      reset();

      let runId = 0;
      let hard: ReturnType<typeof setTimeout> | undefined;

      const finish = (id: number) => {
        if (id !== runId) return;
        clearTimeout(hard);
        reset();
        busy.current = false;
        const ui = useUI.getState();
        ui.setIntroDone(true);
        ui.setTransitioning(false);
        // the cover is gone: re-measure when the main thread is idle, not in the middle of the uncover frames
        if ("requestIdleCallback" in window) window.requestIdleCallback(() => ScrollTrigger.refresh(), { timeout: 600 });
        else setTimeout(() => ScrollTrigger.refresh(), 200);
      };

      const play = (tl: gsap.core.Timeline) =>
        new Promise<void>((res) => {
          tl.eventCallback("onComplete", () => res());
        });

      const run = async (href: string, opts?: NavOpts) => {
        if (busy.current) return;
        const url = new URL(href, window.location.href);
        const ui = useUI.getState();
        const method = opts?.replace ? "replace" : "push";

        if (prefersReducedMotion()) {
          ui.setMenuOpen(false);
          ui.setCartOpen(false);
          router[method](href);
          return;
        }

        busy.current = true;
        const id = ++runId;
        const from = pathRef.current;
        ui.setTransitioning(true);
        hard = setTimeout(() => finish(id), HARD_TIMEOUT);

        try {
          lab.textContent = labelFor(url.pathname);
          reset();
          gsap.set(el, { visibility: "visible", pointerEvents: "auto" });

          // 1 — cover
          const cover = gsap.timeline();
          cover.to(strips, { yPercent: 0, duration: 0.85, ease: "resolve", stagger: 0.07 }, 0);
          cover.to(mark, { scale: 1, duration: 0.5, ease: "expo.out" }, 0.5);
          cover.to(rule, { scaleX: 1, duration: 0.8, ease: "power4.inOut" }, 0.5);
          cover.to(lab, { yPercent: 0, duration: 0.75, ease: "expo.out" }, 0.55);
          await play(cover);
          if (id !== runId) return;

          // 2 — swap the page under the cover
          ui.setMenuOpen(false);
          ui.setCartOpen(false);
          ui.setIntroDone(false); // pages' when="intro" reveals now wait for the cover to lift
          router[method](href);
          await new Promise<void>((res) => {
            const t = setTimeout(res, ROUTE_TIMEOUT);
            waiter.current = (p) => {
              if (p !== from) {
                clearTimeout(t);
                res();
              }
            };
            if (pathRef.current !== from) waiter.current(pathRef.current);
          });
          waiter.current = null;
          if (id !== runId) return;
          await frames(2);
          scrollToTop();
          await new Promise((r) => setTimeout(r, 160));
          if (id !== runId) return;
          scrollToTop();
          ScrollTrigger.refresh();

          // 3 — uncover
          const out = gsap.timeline();
          out.to(lab, { yPercent: -115, duration: 0.5, ease: "power4.in" }, 0);
          out.to([rule, mark], { opacity: 0, duration: 0.25, ease: "none" }, 0);
          out.to(strips, { yPercent: -100, duration: 0.9, ease: "resolve", stagger: 0.06 }, 0.25);
          out.call(() => useUI.getState().setIntroDone(true), undefined, 0.6);
          await play(out);
        } catch {
          /* swallow: finish() below always restores a clean state */
        } finally {
          finish(id);
        }
      };

      const go = contextSafe(run);
      const unregister = registerNavigator((href, opts) => void go(href, opts));
      return () => {
        unregister();
        runId++;
        clearTimeout(hard);
        if (busy.current) {
          busy.current = false;
          const ui = useUI.getState();
          ui.setIntroDone(true);
          ui.setTransitioning(false);
        }
      };
    },
    { scope: root },
  );

  return (
    <>
      {children}
      <div
        ref={root}
        aria-hidden
        className="fixed inset-0 z-[90] overflow-hidden"
        style={{ visibility: "hidden", pointerEvents: "none" }}
      >
        {Array.from({ length: STRIPS }, (_, i) => (
          <div
            key={i}
            data-strip
            className="absolute top-[-1px] bg-ink"
            style={{ left: `${i * (100 / STRIPS)}%`, width: `calc(${100 / STRIPS}% + 1px)`, height: "calc(100% + 2px)" }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5 text-paper">
          <span data-mark className="block h-3 w-3 text-signal">
            <svg viewBox="0 0 11 11" width="12" height="12" aria-hidden>
              <path d="M5.5 0v11M0 5.5h11" stroke="currentColor" fill="none" />
            </svg>
          </span>
          <span className="block overflow-hidden px-2">
            <span
              ref={label}
              className="t-dots block whitespace-nowrap text-[clamp(2.25rem,9vw,8rem)] leading-[1.1]"
            />
          </span>
          <span data-rule className="block h-px w-[min(60vw,420px)] bg-paper/60" />
        </div>
      </div>
    </>
  );
}
