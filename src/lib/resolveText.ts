"use client";
/**
 * STRUCT signature text reveal — "RESOLVE".
 *
 *  1. Every character first exists as unresolved dot-matter: a flickering glyph in the dot font (Bitcount).
 *  2. A hairline scan head (signal orange) sweeps each line left → right, like a load line being drawn.
 *  3. Behind the head, each dot-glyph LOCKS into the real letter: the real glyph is wiped up from its
 *     baseline while the dot glyph is wiped away upward — a seam of structure rising through the character.
 *  4. When finished, all scaffolding (ghost glyphs, scan heads, ticker) is removed — the DOM is clean text.
 *
 * Used by <SplitReveal/> (all site text) and callable directly: resolveSplit(el, splitTextInstance, opts).
 * The element must have been split with SplitText { type: "lines,words,chars" }.
 */
import { gsap } from "@/lib/gsap";

const GLYPHS = "0123456789+-/=#*<>:;";
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/**
 * ONE shared flicker ticker for every reveal on the page. A reveal only joins it while its timeline is actually
 * playing (before that its ghost glyphs are invisible, so touching them would only cost layout + paint), and the
 * number of text writes per tick is capped globally so a page with many concurrent reveals stays cheap.
 */
type Flicker = { open: { ghost: HTMLElement; locked: boolean; k: number }[] };
const flickers = new Set<Flicker>();
let flickLast = 0;
const FLICK_EVERY = 0.065;
const FLICK_BUDGET = 90; // text writes per tick, all reveals together
function flickTick(time: number) {
  if (time - flickLast < FLICK_EVERY) return;
  flickLast = time;
  let budget = FLICK_BUDGET;
  const share = Math.max(8, Math.floor(FLICK_BUDGET / Math.max(flickers.size, 1)));
  for (const f of flickers) {
    const n = Math.min(f.open.length, share, budget);
    for (let k = 0; k < n; k++) f.open[(Math.random() * f.open.length) | 0].ghost.textContent = rnd();
    budget -= n;
    if (budget <= 0) break;
  }
}
function flickAdd(f: Flicker) {
  if (!flickers.size) gsap.ticker.add(flickTick);
  flickers.add(f);
}
function flickRemove(f: Flicker) {
  flickers.delete(f);
  if (!flickers.size) gsap.ticker.remove(flickTick);
}

export type ResolveOpts = {
  delay?: number;
  /** 1 = default pace. Body copy uses ~1.7 */
  speed?: number;
  /** show the orange scan head */
  head?: boolean;
  scrollTrigger?: gsap.plugins.ScrollTriggerInstanceVars;
  /** build the timeline paused (caller plays it). Defaults to true when a scrollTrigger is passed. */
  paused?: boolean;
  onComplete?: () => void;
};

type SplitLike = { lines: Element[]; words: Element[]; chars: Element[] };

/** Builds the RESOLVE timeline for an already-split element. Returns { tl, cleanup }. */
export function resolveSplit(el: HTMLElement, split: SplitLike, opts: ResolveOpts = {}) {
  const { delay = 0, speed = 1, head = true, scrollTrigger, paused, onComplete } = opts;
  const chars = split.chars as HTMLElement[];
  const lines = split.lines as HTMLElement[];

  if (getComputedStyle(el).position === "static") el.style.position = "relative";

  // 1 — WRITE phase: wrap every char: [real glyph][ghost dot glyph]
  type C = { box: HTMLElement; real: HTMLElement; ghost: HTMLElement; locked: boolean; k: number };
  const items: C[] = chars.map((box) => {
    const text = box.textContent ?? "";
    box.textContent = "";
    box.style.display = "inline-block";
    box.style.position = "relative";
    const real = document.createElement("span");
    real.textContent = text;
    real.style.display = "inline-block";
    const ghost = document.createElement("span");
    ghost.setAttribute("aria-hidden", "true");
    ghost.textContent = rnd();
    ghost.style.cssText =
      "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;" +
      "font-family:var(--font-bitcount),ui-monospace,monospace;font-size:.78em;line-height:1;letter-spacing:0;text-transform:none;font-weight:400;" +
      "opacity:0;clip-path:inset(0% 0% 0% 0%);";
    box.append(real, ghost);
    return { box, real, ghost, locked: false, k: 0 };
  });
  items.forEach((i) => (i.real.style.clipPath = "inset(100% 0% 0% 0%)"));

  // 2 — READ phase: every rect is measured in ONE pass (a single layout) before anything else is written
  const elRect = el.getBoundingClientRect();
  const lineSet = new Set<Element>(lines);
  const perLine = new Map<Element, C[]>();
  for (const it of items) {
    let n: Element | null = it.box.parentElement;
    while (n && !lineSet.has(n)) n = n.parentElement;
    if (!n) continue;
    const arr = perLine.get(n);
    if (arr) arr.push(it);
    else perLine.set(n, [it]);
  }
  const measured = lines.map((line) => {
    const lineChars = perLine.get(line) ?? [];
    return { line, lineChars, lr: line.getBoundingClientRect(), rects: lineChars.map((i) => i.box.getBoundingClientRect()) };
  });

  // 3 — WRITE phase: scan heads + the timeline
  const heads: HTMLElement[] = [];
  const flick: Flicker = { open: [] };
  let done = false;
  const tl = gsap.timeline({
    delay,
    paused: paused ?? !!scrollTrigger,
    scrollTrigger,
    onStart: () => {
      if (done) return;
      flick.open = items.filter((i) => !i.locked);
      flick.open.forEach((i, k) => (i.k = k));
      flickAdd(flick);
    },
    onComplete: () => {
      cleanup();
      onComplete?.();
    },
  });

  // locked glyph leaves the flicker pool (swap-remove, O(1))
  const lock = (it: C) => {
    it.locked = true;
    const o = flick.open;
    if (o[it.k] !== it) return; // pool not built yet (reveal skipped ahead) or already removed
    const last = o.pop()!;
    if (last !== it) {
      o[it.k] = last;
      last.k = it.k;
    }
  };

  // ghosts flash into existence (unresolved matter)
  tl.to(
    items.map((i) => i.ghost),
    { opacity: 1, duration: 0.05, stagger: { each: Math.min(0.5 / Math.max(items.length, 1), 0.012), from: "random" } },
    0,
  );

  measured.forEach(({ lineChars, lr, rects }, li) => {
    if (!lineChars.length) return;
    // the sweep covers the actual TEXT extent of the line, not the (often wider) line box
    let x0 = Infinity;
    let x1 = -Infinity;
    for (const r of rects) {
      if (r.left < x0) x0 = r.left;
      if (r.right > x1) x1 = r.right;
    }
    const extent = Math.max(x1 - x0, 1);
    const dur = gsap.utils.clamp(0.55, 1.5, 0.4 + lineChars.length * 0.016) / speed;
    const start = 0.3 / speed + li * 0.16 / speed;

    if (head) {
      const h = document.createElement("div");
      h.setAttribute("aria-hidden", "true");
      h.style.cssText =
        `position:absolute;left:0;top:${lr.top - elRect.top}px;width:2px;height:${lr.height}px;` +
        "background:var(--signal);opacity:0;pointer-events:none;z-index:2;will-change:transform;";
      el.append(h);
      heads.push(h);
      tl.fromTo(h, { x: x0 - elRect.left, opacity: 1 }, { x: x1 - elRect.left, duration: dur, ease: "none" }, start);
      tl.to(h, { opacity: 0, duration: 0.15, ease: "none" }, start + dur);
    }

    lineChars.forEach((it, k) => {
      const frac = (rects[k].left - x0) / extent;
      const t = start + Math.max(0, Math.min(1, frac)) * dur;
      tl.to(it.real, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "expo.out" }, t);
      tl.to(it.ghost, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.45, ease: "expo.out", onStart: () => lock(it) }, t);
    });
  });

  function cleanup() {
    if (done) return;
    done = true;
    flickRemove(flick);
    flick.open = [];
    heads.forEach((h) => h.remove());
    items.forEach((i) => {
      i.ghost.remove();
      i.real.style.clipPath = "";
    });
  }

  return { tl, cleanup };
}
