"use client";
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** Same glyph pool as the RESOLVE reveal (src/lib/resolveText.ts) — dot-matrix matter that has not locked yet. */
const GLYPHS = "0123456789+-/=#*<>:;";
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

const GHOST_CSS =
  "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;" +
  "font-family:var(--font-bitcount),ui-monospace,monospace;font-size:.78em;line-height:1;letter-spacing:0;font-weight:400;";

type Props = {
  /** the word to show right now */
  word: string;
  /** the word that is the resting state; it is rendered by `idle` (a normal SplitReveal) and the swap layer sits on top of it */
  idleWord: string;
  /** the resting state element (e.g. a <SplitReveal as="h2">) */
  idle: ReactNode;
  className?: string;
  /** typography classes shared with the idle element so the swap layer matches it exactly */
  wordClassName?: string;
};

/**
 * The original STRUCTS → NAME hover idea, re-engineered in the site's RESOLVE language:
 * on change every character of the new word starts as a flickering dot-glyph and LOCKS into the real letter,
 * staggered from the CENTRE outward. Returning to `idleWord` resolves back, then hands over to the idle element.
 */
export default function SwapWord({ word, idleWord, idle, className = "", wordClassName = "" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const stop = useRef<(() => void) | null>(null);

  useGSAP(
    () => {
      const L = layer.current;
      const B = base.current;
      if (!L || !B) return;
      stop.current?.();
      stop.current = null;
      L.replaceChildren();
      if (word === idleWord && B.style.opacity === "") return; // already resting: the idle element is simply visible
      const toIdle = word === idleWord;
      const chars = [...word];
      const n = chars.length;
      const reduce = prefersReducedMotion();

      type Cell = { real: HTMLElement; ghost: HTMLElement; locked: boolean };
      const cells: Cell[] = chars.map((ch) => {
        const box = document.createElement("span");
        box.style.cssText = "display:inline-block;position:relative;";
        const real = document.createElement("span");
        real.textContent = ch;
        real.style.display = "inline-block";
        const ghost = document.createElement("span");
        ghost.setAttribute("aria-hidden", "true");
        ghost.style.cssText = GHOST_CSS;
        ghost.textContent = rnd();
        box.append(real, ghost);
        L.append(box);
        return { real, ghost, locked: false };
      });
      B.style.opacity = "0";

      const finish = () => {
        stop.current?.();
        stop.current = null;
        if (toIdle) {
          L.replaceChildren();
          B.style.opacity = "";
        } else {
          cells.forEach((c) => c.ghost.remove());
        }
      };
      if (reduce) {
        cells.forEach((c) => c.ghost.remove());
        if (toIdle) finish();
        return;
      }

      gsap.set(cells.map((c) => c.real), { clipPath: "inset(100% 0% 0% 0%)" });
      const tl = gsap.timeline({ onComplete: finish });
      cells.forEach((c, i) => {
        const t = Math.abs(i - (n - 1) / 2) * 0.1 + 0.08; // from the centre outward
        tl.call(() => { c.locked = true; }, undefined, t);
        tl.to(c.real, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "expo.out" }, t);
        tl.to(c.ghost, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.45, ease: "expo.out" }, t);
      });

      let last = 0;
      const tick = (time: number) => {
        if (time - last < 0.055) return;
        last = time;
        for (const c of cells) if (!c.locked) c.ghost.textContent = rnd();
      };
      gsap.ticker.add(tick);
      stop.current = () => gsap.ticker.remove(tick);
    },
    { scope: root, dependencies: [word, idleWord] },
  );

  return (
    <div ref={root} className={`relative ${className}`}>
      <div ref={base}>{idle}</div>
      <div ref={layer} aria-hidden className={`pointer-events-none absolute inset-0 flex items-center justify-center whitespace-nowrap ${wordClassName}`} />
      <span className="sr-only" aria-live="polite">
        {word === idleWord ? "" : word}
      </span>
    </div>
  );
}
