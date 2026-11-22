import { gsap } from "@/lib/gsap";

const GLYPHS = "0123456789+-/=#*<>:;";
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
const live = new WeakMap<HTMLElement, gsap.core.Tween>();

/**
 * Non-reveal text swap in the STRUCT language: dot-glyphs flicker, then lock left→right.
 * (Used for counters / step numerals that change after they are already on screen.)
 */
export function flickerSwap(el: HTMLElement, next: string, duration = 0.55) {
  live.get(el)?.kill();
  const o = { p: 0 };
  const tw = gsap.to(o, {
    p: 1,
    duration,
    ease: "none",
    onUpdate: () => {
      let s = "";
      for (let i = 0; i < next.length; i++) {
        s += next[i] === " " || o.p >= (i + 1) / next.length ? next[i] : rnd();
      }
      el.textContent = s;
    },
    onComplete: () => {
      el.textContent = next;
    },
  });
  live.set(el, tw);
  return tw;
}
