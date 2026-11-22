"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, SplitText, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { resolveSplit } from "@/lib/resolveText";
import { enqueue } from "@/lib/workQueue";
import { useUI } from "@/store/ui";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /**
   * "resolve" (default) — the STRUCT signature reveal: dot-matrix glyphs flicker, an orange scan head
   *   sweeps each line, glyphs lock into real letters (see src/lib/resolveText.ts). USE THIS EVERYWHERE.
   * "mask" — plain masked rise. Only for very long copy (auto-fallback above ~380 characters) or tiny UI strings.
   */
  variant?: "resolve" | "mask";
  /** "scroll": play when scrolled into view · "intro": wait for the preloader, then play · "mount": immediately */
  when?: "scroll" | "intro" | "mount";
  delay?: number;
  /** pace multiplier: headings 1 (default), paragraphs ~1.6, tiny labels ~2 */
  speed?: number;
  /** show the orange scan head (default true; turn off when several reveals share a viewport) */
  head?: boolean;
  /** ScrollTrigger start (when="scroll") */
  start?: string;
};

/**
 * STRUCT text reveal. Usage: <SplitReveal as="h2" className="t-h2">We didn't like design.</SplitReveal>
 * Children must be plain text. EVERY text reveal on the site goes through this component.
 *
 * Robustness: the ScrollTrigger is created ONCE per element (never inside the SplitText re-split callback),
 * and a re-split after the reveal has started (resize, font load) jumps straight to the finished text.
 */
export default function SplitReveal({
  as: Tag = "div",
  children,
  className,
  variant = "resolve",
  when = "scroll",
  delay = 0,
  speed = 1,
  head = true,
  start = "top 88%",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current;
      if (!el || !contextSafe) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { visibility: "visible" });
        return;
      }

      const useResolve = variant === "resolve" && (el.textContent ?? "").length <= 380;
      // armed: the moment to play has come · playing: the timeline has been started (a re-split then jumps to the end)
      const state: { armed: boolean; playing: boolean; tl: gsap.core.Animation | null } = { armed: false, playing: false, tl: null };
      const play = () => {
        state.armed = true;
        if (state.tl && !state.playing) {
          state.playing = true;
          state.tl.play();
        }
      };

      let built = false;
      let unsub: (() => void) | undefined;
      let cleanup: (() => void) | undefined;

      // The expensive part (SplitText + RESOLVE timeline = many DOM writes and forced layouts) is built lazily,
      // a little per frame, and for scroll reveals only when the element is near the viewport.
      const build = contextSafe(() => {
        if (built) return;
        built = true;
        if (when === "scroll") ScrollTrigger.create({ trigger: el, start, once: true, onEnter: play });
        else if (when === "mount") state.armed = true;
        else if (useUI.getState().introDone) state.armed = true;
        else unsub = useUI.subscribe((s) => s.introDone && (unsub?.(), (unsub = undefined), play()));

        SplitText.create(el, {
          type: useResolve ? "lines,words,chars" : "lines",
          mask: useResolve ? undefined : "lines",
          autoSplit: true,
          onSplit(self) {
            cleanup?.();
            gsap.set(el, { visibility: "visible" });
            let tl: gsap.core.Animation;
            if (useResolve) {
              const r = resolveSplit(el, self, { delay, speed, head, paused: true });
              cleanup = r.cleanup;
              tl = r.tl;
            } else {
              tl = gsap.from(self.lines, { yPercent: 115, duration: 1.1, delay, stagger: 0.08, ease: "expo.out", paused: true });
            }
            state.tl = tl;
            if (state.playing) {
              tl.progress(1); // re-split after the reveal began: show the finished text
              cleanup?.();
            } else if (state.armed) {
              state.playing = true;
              tl.play();
            }
            return tl;
          },
          onRevert() {
            cleanup?.();
          },
        });
      });

      let cancel = () => {};
      let io: IntersectionObserver | undefined;
      let late: ReturnType<typeof setTimeout> | undefined;
      if (when === "scroll" && typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting || e.boundingClientRect.top < 0)) return;
            io?.disconnect();
            cancel();
            cancel = enqueue(build, "soon");
          },
          { rootMargin: "60% 0px 60% 0px" },
        );
        io.observe(el);
        // safety net (e.g. content inside a horizontally panned track): split eventually even if never "near"
        late = setTimeout(() => (cancel = enqueue(build, "idle")), 3000);
      } else {
        cancel = enqueue(build, "soon");
      }

      return () => {
        io?.disconnect();
        clearTimeout(late);
        cancel();
        unsub?.();
      };
    },
    { scope: ref, dependencies: [variant, when] },
  );

  return (
    // hidden until split so unsplit text never flashes
    <Tag ref={ref} className={className} style={{ visibility: "hidden" }}>
      {children}
    </Tag>
  );
}
