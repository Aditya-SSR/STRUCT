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
 *
 * Cost model (this runs on phones): a reveal used to own two GSAP tweens PER CHARACTER (clip-path strings, parsed and
 * re-rendered every frame). It now owns ONE driver tween per reveal that writes only the glyphs currently in
 * transition, straight to `style.clipPath`, skipping unchanged values and (on phones) updating at ~30 Hz.
 * Scaffold styling lives in one injected stylesheet (classes) instead of per-glyph `cssText`.
 */
import { gsap } from "@/lib/gsap";
import { isLite } from "@/lib/device";

const GLYPHS = "0123456789+-/=#*<>:;";
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/** scaffold styles, injected once (per-glyph inline `cssText` was a measurable share of the split cost) */
let styled = false;
function ensureStyles() {
  if (styled || typeof document === "undefined") return;
  styled = true;
  const st = document.createElement("style");
  st.setAttribute("data-resolve", "");
  st.textContent =
    ".rs-box{display:inline-block;position:relative}" +
    ".rs-real{display:inline-block}" +
    ".rs-hide{clip-path:inset(100% 0% 0% 0%)}" +
    ".rs-ghost{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;" +
    "font-family:var(--font-bitcount),ui-monospace,monospace;font-size:.78em;line-height:1;letter-spacing:0;text-transform:none;font-weight:400;" +
    "opacity:0;clip-path:inset(0% 0% 0% 0%)}";
  document.head.appendChild(st);
}

/**
 * ONE shared flicker ticker for every reveal on the page. A reveal only joins it while its timeline is actually
 * playing (before that its ghost glyphs are invisible, so touching them would only cost layout + paint), and the
 * number of text writes per tick is capped globally so a page with many concurrent reveals stays cheap.
 */
type Flicker = { open: { ghost: HTMLElement; locked: boolean; k: number }[] };
const flickers = new Set<Flicker>();
let flickLast = 0;
let flickEvery = 0.065;
let flickBudget = 90; // text writes per tick, all reveals together
function flickTick(time: number) {
  if (time - flickLast < flickEvery) return;
  flickLast = time;
  let budget = flickBudget;
  const share = Math.max(8, Math.floor(flickBudget / Math.max(flickers.size, 1)));
  for (const f of flickers) {
    const n = Math.min(f.open.length, share, budget);
    for (let k = 0; k < n; k++) f.open[(Math.random() * f.open.length) | 0].ghost.textContent = rnd();
    budget -= n;
    if (budget <= 0) break;
  }
}
function flickAdd(f: Flicker) {
  if (!flickers.size) {
    // phones: fewer, rarer writes (each is a text-node swap + a layout of an absolutely positioned glyph)
    const lite = isLite();
    flickEvery = lite ? 0.1 : 0.065;
    flickBudget = lite ? 28 : 90;
    gsap.ticker.add(flickTick);
  }
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

const REAL_DUR = 0.55; // real glyph wipe-up
const GHOST_DUR = 0.45; // dot glyph wipe-away
/** expo.out, closed form (matches gsap's "expo.out") */
const expoOut = (p: number) => (p >= 1 ? 1 : p <= 0 ? 0 : 1 - Math.pow(2, -10 * p));
/** percent with 0.5 resolution: below that a clip edge is sub-pixel on glyph-sized boxes, so the write is skipped */
const q = (v: number) => Math.round(v * 200) / 200;

/**
 * Phones, long copy: no per-glyph scaffold (that is 3 elements + 2 style writes per character). Each LINE is wiped in
 * left → right behind the same orange scan head — the RESOLVE sweep without the dot glyphs.
 */
function resolveLines(el: HTMLElement, lines: HTMLElement[], opts: ResolveOpts) {
  const { delay = 0, speed = 1, head = true, scrollTrigger, paused, onComplete } = opts;
  if (getComputedStyle(el).position === "static") el.style.position = "relative";
  const elRect = el.getBoundingClientRect();
  const measured = lines.map((l) => l.getBoundingClientRect());
  const heads: HTMLElement[] = [];
  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    heads.forEach((h) => h.remove());
    lines.forEach((l) => (l.style.clipPath = ""));
  };
  const tl = gsap.timeline({
    delay,
    paused: paused ?? !!scrollTrigger,
    scrollTrigger,
    onComplete: () => {
      cleanup();
      onComplete?.();
    },
  });
  lines.forEach((line, i) => {
    const r = measured[i];
    const start = (0.2 + i * 0.12) / speed;
    const dur = 0.7 / speed;
    line.style.clipPath = "inset(0% 100% 0% 0%)";
    tl.to(line, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease: "power3.out" }, start);
    if (head) {
      const h = document.createElement("div");
      h.setAttribute("aria-hidden", "true");
      h.style.cssText =
        `position:absolute;left:0;top:${r.top - elRect.top}px;width:2px;height:${r.height}px;` +
        "background:var(--signal);opacity:0;pointer-events:none;z-index:2;will-change:transform;";
      el.append(h);
      heads.push(h);
      tl.fromTo(h, { x: r.left - elRect.left, opacity: 1 }, { x: r.right - elRect.left, duration: dur, ease: "power3.out" }, start);
      tl.to(h, { opacity: 0, duration: 0.15, ease: "none" }, start + dur);
    }
  });
  return { tl, cleanup };
}

/** longest copy (characters) that keeps the per-glyph dot flicker on a phone; beyond it the lines are wiped in */
const LITE_GLYPH_MAX = 160;

/** Builds the RESOLVE timeline for an already-split element. Returns { tl, cleanup }. */
export function resolveSplit(el: HTMLElement, split: SplitLike, opts: ResolveOpts = {}) {
  const { delay = 0, speed = 1, head = true, scrollTrigger, paused, onComplete } = opts;
  const chars = split.chars as HTMLElement[];
  const lines = split.lines as HTMLElement[];
  const lite = isLite();
  if (lite && chars.length > LITE_GLYPH_MAX) return resolveLines(el, lines, opts);
  ensureStyles();

  if (getComputedStyle(el).position === "static") el.style.position = "relative";

  // 1 — WRITE phase: wrap every char: [real glyph][ghost dot glyph]
  type C = {
    box: HTMLElement;
    real: HTMLElement;
    ghost: HTMLElement;
    locked: boolean;
    k: number;
    /** when this glyph's wipe starts (timeline seconds) */
    t: number;
    /** when its dot glyph first appears */
    tg: number;
    /** last clip-path strings written (real / ghost) */
    a: string;
    b: string;
  };
  const items: C[] = chars.map((box) => {
    const text = box.textContent ?? "";
    box.textContent = "";
    box.classList.add("rs-box");
    const real = document.createElement("span");
    real.className = "rs-real rs-hide";
    real.textContent = text;
    const ghost = document.createElement("span");
    ghost.className = "rs-ghost";
    ghost.setAttribute("aria-hidden", "true");
    ghost.textContent = rnd();
    box.append(real, ghost);
    return { box, real, ghost, locked: false, k: 0, t: 0, tg: 0, a: "", b: "" };
  });

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

  // ghosts flash into existence (unresolved matter): random order over the first ~0.5s
  const each = Math.min(0.5 / Math.max(items.length, 1), 0.012);
  const order = items.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [order[i], order[j]] = [order[j], order[i]];
  }
  order.forEach((idx, rank) => (items[idx].tg = rank * each));

  let total = each * items.length + 0.05;
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
    const start = 0.3 / speed + (li * 0.16) / speed;

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
      total = Math.max(total, start + dur + 0.15);
    }

    lineChars.forEach((it, k) => {
      const frac = (rects[k].left - x0) / extent;
      it.t = start + Math.max(0, Math.min(1, frac)) * dur;
      total = Math.max(total, it.t + REAL_DUR);
    });
  });

  // ONE driver for every glyph: the dots appear, then each glyph's real/ghost wipe runs — written only while in motion
  const byStart = items.slice().sort((a, b) => a.t - b.t);
  const byAppear = items.slice().sort((a, b) => a.tg - b.tg);
  let ai = 0; // next ghost to appear
  let si = 0; // next glyph to start its wipe
  let active: C[] = [];
  let lastStep = -1;
  const minGap = lite ? 1 / 32 : 0; // phones: ~30 Hz glyph updates (the glyphs are tiny, the eye can't tell)
  const state = { t: 0 };
  const step = (now: number) => {
    if (done) return;
    if (minGap && now < total && now - lastStep < minGap) return;
    lastStep = now;
    while (ai < byAppear.length && byAppear[ai].tg <= now) byAppear[ai++].ghost.style.opacity = "1";
    while (si < byStart.length && byStart[si].t <= now) {
      const it = byStart[si++];
      lock(it); // its dot glyph leaves the flicker pool the moment its wipe starts
      active.push(it);
    }
    let w = 0;
    for (let i = 0; i < active.length; i++) {
      const it = active[i];
      const pr = (now - it.t) / REAL_DUR;
      const pg = (now - it.t) / GHOST_DUR;
      const a = `inset(${q((1 - expoOut(pr)) * 100)}% 0% 0% 0%)`;
      const b = `inset(0% 0% ${q(expoOut(pg) * 100)}% 0%)`;
      if (a !== it.a) it.real.style.clipPath = it.a = a;
      if (b !== it.b) it.ghost.style.clipPath = it.b = b;
      if (pr < 1) active[w++] = it; // finished glyphs drop out (their last write was the final state)
    }
    active.length = w;
  };
  tl.to(state, { t: total, duration: total, ease: "none", onUpdate: () => step(state.t) }, 0);

  function cleanup() {
    if (done) return;
    done = true;
    flickRemove(flick);
    flick.open = [];
    active = [];
    heads.forEach((h) => h.remove());
    items.forEach((i) => {
      i.ghost.remove();
      i.real.classList.remove("rs-hide");
      i.real.style.clipPath = "";
    });
  }

  return { tl, cleanup };
}
