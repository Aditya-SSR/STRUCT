"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import { useUI } from "@/store/ui";
import PreloaderScene from "./PreloaderScene";

const SESSION_KEY = "struct:intro";
const MIN_TIME = 2.4; // counter always takes at least this long (real progress = fonts + min time)
const FROM = [{ yPercent: -135 }, { xPercent: 135 }, { yPercent: 135 }, { xPercent: -135 }, { xPercent: 135 }, { yPercent: -135 }];

/**
 * ASSEMBLY preloader. Ink panel, hairline frame + datum crosses draw, a Bitcount counter runs 000 → 100 while the
 * word STRUCT assembles letter by letter (each slides in from its own side and locks with a signal datum flash).
 * At 100 the counter dissolves and the panel SPLITS horizontally (top up, bottom down), then introDone flips.
 * Full version once per session; later loads run a ~0.8s version; reduced motion skips it. Plain GSAP only
 * (this runs before introDone, so no SplitReveal).
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    (_c, contextSafe) => {
      const el = root.current;
      if (!el || !contextSafe) return;
      const ui = useUI.getState();

      let seen = false;
      try {
        seen = sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {
        /* storage blocked: treat as first visit */
      }
      if (prefersReducedMotion()) {
        el.style.display = "none";
        ui.setIntroDone(true);
        return;
      }
      const fast = seen;

      lockScroll("preloader");

      // exact panel height for the two halves
      const measure = () => el.style.setProperty("--ph", `${el.clientHeight}px`);
      measure();
      window.addEventListener("resize", measure);

      const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, el);
      const lines = q(".pl-line");
      const hLines = lines.filter((l) => l.dataset.o === "h");
      const vLines = lines.filter((l) => l.dataset.o === "v");
      const corners = q(".pl-corner");
      const letters = q(".pl-letter");
      const flashes = q(".pl-flash");
      const metas = q(".pl-meta");
      const digits = q(".pl-d");
      const phases = q(".pl-phase");
      const halves = q("[data-half]"); // [top, bottom]
      const word = (i: number) => letters.filter((_, k) => k % 6 === i); // both copies of letter i
      const flash = (i: number) => flashes.filter((_, k) => k % 6 === i);

      // ── initial states (SSR markup is opacity 0) ──
      gsap.set(hLines, { opacity: 1, scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(vLines, { opacity: 1, scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(corners, { opacity: 1, scale: 0 });
      gsap.set(metas, { opacity: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(digits, { opacity: 1 });
      for (let i = 0; i < 6; i++) gsap.set(word(i), { opacity: 1, ...(fast ? {} : FROM[i]) });
      gsap.set(flashes, { opacity: 0, scale: 0 });

      // ── counter ──
      const state = { v: 0 };
      let ready = false;
      let finished = false;
      const shown = () => Math.round(ready ? state.v : Math.min(state.v, 92));
      const render = (n: number) => {
        const s = String(n).padStart(3, "0");
        digits.forEach((d, k) => {
          const i = k % 3;
          d.textContent = s[i];
          d.style.opacity = i < 3 - String(n).length ? "0.3" : "1";
        });
        const label = n < 34 ? "01 LOAD" : n < 67 ? "02 LINE" : "03 RESOLVE";
        phases.forEach((p) => {
          if (p.textContent !== label) p.textContent = label;
        });
      };
      render(0);

      // fonts: the word & digits must not be shown in fallback faces
      const families = [letters[0], digits[0]].map((n) => getComputedStyle(n).fontFamily);
      const fontsReady = Promise.race([
        Promise.all([...families.map((f) => document.fonts.load(`1em ${f}`)), document.fonts.ready]),
        new Promise((r) => setTimeout(r, 4500)),
      ]).then(() => {
        ready = true;
      });

      // ── build ──
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      const k = fast ? 0.2 : 1; // time scale of the intro phase

      tl.to(hLines, { scaleX: 1, duration: 1.2 * k, ease: "power4.inOut" }, 0);
      tl.to(vLines, { scaleY: 1, duration: 1.2 * k, ease: "power4.inOut" }, 0.08 * k);
      tl.to(corners, { scale: 1, duration: 0.6 * k, ease: "expo.out", stagger: 0.08 * k }, 0.5 * k);
      tl.to(metas, { clipPath: "inset(0 0% 0 0)", duration: 0.9 * k, ease: "power4.inOut", stagger: 0.07 * k }, 0.45 * k);

      if (!fast) {
        for (let i = 0; i < 6; i++) {
          const at = 0.55 + i * 0.17;
          tl.to(word(i), { xPercent: 0, yPercent: 0, duration: 0.95, ease: "expo.out" }, at);
          const f = flash(i);
          tl.set(f, { opacity: 1, scale: 0 }, at + 0.55);
          tl.to(f, { scale: 1.1, duration: 0.2, ease: "power3.out" }, at + 0.55);
          tl.to(f, { opacity: 0, duration: 0.4, ease: "power2.in" }, at + 0.75);
        }
      }
      tl.to(
        state,
        {
          v: 100,
          duration: fast ? 0.25 : MIN_TIME,
          ease: fast ? "power2.out" : "power2.inOut",
          onUpdate: () => render(shown()),
        },
        fast ? 0 : 0.3,
      );

      // ── outro: counter dissolves, then the panel splits ──
      const finish = () => {
        if (finished) return;
        finished = true;
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* ignore */
        }
        unlockScroll("preloader");
        window.removeEventListener("resize", measure);
        el.style.display = "none";
        const u = useUI.getState();
        if (!u.introDone) u.setIntroDone(true);
        ScrollTrigger.refresh();
        setGone(true);
      };

      const outro = contextSafe(() => {
        if (finished) return;
        render(100);
        const o = gsap.timeline({ onComplete: finish });
        const flick = { p: 0 };
        let frame = 0;
        // dissolve: digits flicker through unresolved matter, then wipe upward
        o.to(flick, {
          p: 1,
          duration: fast ? 0.01 : 0.42,
          ease: "none",
          onUpdate: () => {
            if (frame++ % 3) return;
            digits.forEach((d) => (d.textContent = String((Math.random() * 10) | 0)));
          },
          onComplete: () => render(100),
        });
        o.to(digits, { clipPath: "inset(0 0 100% 0)", duration: fast ? 0.15 : 0.5, ease: "power4.inOut", stagger: { each: fast ? 0.02 : 0.05, from: "start" } }, ">-0.02");
        o.to(metas, { clipPath: "inset(0 0 0 100%)", duration: fast ? 0.2 : 0.6, ease: "power4.inOut", stagger: 0.04 }, "<0.05");
        // split
        const dur = fast ? 0.55 : 1.15;
        o.to(halves[0], { yPercent: -100, duration: dur, ease: "resolve" }, fast ? "<0.04" : ">0.05");
        o.to(halves[1], { yPercent: 100, duration: dur, ease: "resolve" }, "<");
        o.call(() => useUI.getState().setIntroDone(true), undefined, "<" + (dur * 0.38).toFixed(2));
      });

      tl.eventCallback("onComplete", () => {
        fontsReady.then(() => {
          // jump any capped value to 100, then outro
          outro();
        });
      });

      // failsafe: never hold the site hostage
      const hard = setTimeout(() => {
        tl.kill();
        gsap.killTweensOf(halves);
        finish();
      }, 12000);

      return () => {
        clearTimeout(hard);
        window.removeEventListener("resize", measure);
        if (!finished) {
          finished = true;
          unlockScroll("preloader");
        }
      };
    },
    { scope: root },
  );

  if (gone) return null;
  return (
    <div
      id="preloader"
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ ["--ph" as string]: "100svh" }}
    >
      {(["top", "bottom"] as const).map((half) => (
        <div
          key={half}
          data-half={half}
          className="absolute inset-x-0 overflow-hidden bg-ink will-change-transform"
          style={half === "top" ? { top: 0, height: "calc(var(--ph) / 2 + 1px)" } : { bottom: 0, height: "calc(var(--ph) / 2)" }}
        >
          <div
            className="absolute inset-x-0 [container-type:inline-size]"
            style={half === "top" ? { top: 0, height: "var(--ph)" } : { bottom: 0, height: "var(--ph)" }}
          >
            <PreloaderScene />
          </div>
        </div>
      ))}
    </div>
  );
}
