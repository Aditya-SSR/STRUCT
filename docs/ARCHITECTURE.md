# STRUCT — Architecture & build contract

Read `docs/BRAND.md` first (story, identity, voice, motion rules). This file says **who owns which files** and **what contracts exist between them**, so five agents can build in parallel without colliding.

## Stack
Next.js **16.4** (App Router, **NOT the Next you know** — read the relevant guide in `node_modules/next/dist/docs/` before using any Next API; e.g. dynamic route `params` is a `Promise`), React 19.3, TypeScript strict, Tailwind v4 (`@theme` tokens in `src/app/globals.css`), GSAP 3.15 (+ `@gsap/react` `useGSAP`, ScrollTrigger, SplitText, Flip, Observer — all free), Lenis 1.3, Zustand 5, three 0.187 + `@react-three/fiber` 9 + `@react-three/drei` 10, `cobe` 2.

Skills to read before coding (they are in `~/.claude/skills/<name>/SKILL.md`): `gsap-core`, `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-plugins`, `gsap-performance`, `awwwards` (+ its `references/` as needed).

## Non-negotiables
- **Import GSAP only from `@/lib/gsap`** (plugins registered once). Use `useGSAP` with `{ scope }`; create tweens inside it so they clean up. Wrap callbacks that run after the hook (event handlers, async) in `contextSafe`.
- **Internal links → `<TransitionLink>`** (`@/components/ui/TransitionLink`) or `<Button href>`. Never raw `next/link`.
- **ALL text reveals → `<SplitReveal>`** (`@/components/ui/SplitReveal`), which runs the STRUCT signature **RESOLVE** reveal (`src/lib/resolveText.ts`): characters start as flickering dot-matrix glyphs (Bitcount), an orange scan head sweeps each line, and glyphs lock into the real letters. **Do not invent other text-reveal animations** (no per-page fades/slides/masks for text; no raw SplitText reveals). Props: `as`, `className`, `when="scroll|intro|mount"` (hero/above-the-fold use `intro`), `delay`, `speed` (headings 1, paragraphs ~1.6, small labels ~2), `head={false}` when several reveals share a viewport. Text beyond ~380 chars automatically falls back to a masked line rise. Children must be plain text strings. For *non-reveal* text interactions (e.g. hover swaps) reuse the same language: dot-glyph flicker → lock.
- Fonts via classes in `globals.css`: `.t-mega .t-h1 .t-h2 .t-h3 .t-lead .t-body .t-label .t-dots`, or Tailwind `font-display` (Monument) / `font-dots` (Bitcount) / `font-mono` (Space Mono). **Monument is UPPERCASE only.** Bitcount is for numbers/short labels only.
- Colours only via tokens: `ink paper bone ash smoke signal`. `signal` (#FF5A00) is a tiny accent — never a background wash. **Zero border radius. No shadows.**
- **Images:** `/public/img/<key>.webp` (see `public/img/manifest.json`; sizes in it). Use `next/image` with explicit `width/height` (from manifest) or `fill` + `sizes`. Always meaningful `alt`.
- **SUIT-01 must not appear** on the intro/hero/early home sections. It is revealed at the end of `/` (just before the footer) and in `/drop-01`.
- Motion rules from BRAND §6.5: expo.out / power4.inOut / `resolve` ease; **no bounce/elastic**; masks not opacity-only; always a `prefers-reduced-motion` path (`prefersReducedMotion()` or `gsap.matchMedia`).
- Responsive: designed desktop-first at 1440 but must work at 390 (mobile) — use `gsap.matchMedia()` for pinned/scrubbed sequences, simplify on mobile.
- Accessibility: semantic landmarks, visible focus (`outline` with `signal`), keyboard-usable menu/cart (Esc closes), `aria-*` on toggles, real `<button>`s, no motion-only information.
- Client components that touch `window`/GSAP/three: `"use client"`. Heavy 3D/globe: `next/dynamic` with `ssr:false`, mount only when near viewport, pause rendering when off-screen, cap `dpr` at 1.75, dispose on unmount, graceful fallback if WebGL is unavailable.
- Keep files focused (<~350 lines); split sub-components.
- **Do NOT run `next dev` or `next build`** (the lead runs the dev server on :3000 and does visual QA). You may `curl http://localhost:3000/<your-route>` to see SSR/compile errors. Verify with `npx tsc --noEmit` and `npx eslint <your files>`. **Do NOT `npm install`** (parallel installs corrupt `node_modules`); if you need a package, list it in your report.
- Only edit files you own (below). If you need a change in a file you don't own, say so in your report instead.

## Ownership

| Agent | Owns (create/edit) |
|---|---|
| **system** | `src/app/layout.tsx`, `src/components/system/*`, `src/components/ui/TransitionLink.tsx` (real implementation), `src/lib/lenis.ts`, `src/app/not-found.tsx` |
| **home** | `src/app/page.tsx`, `src/components/home/*` **except** `NodesSection.tsx` |
| **three** | `src/components/three/*`, `src/components/home/NodesSection.tsx`, `docs/CREDITS.md` |
| **shop** | `src/app/drop-01/**`, `src/components/shop/*`, `src/store/cart.ts` (extend only; keep exports) |
| **people** | `src/app/people/**`, `src/components/people/*` |
| **lead** (not an agent) | `docs/*`, `src/data/*`, `src/lib/gsap.ts`, `src/lib/utils.ts`, `src/store/ui.ts`, `src/components/ui/{SplitReveal,LoadLine,Datum,Button}.tsx`, `src/app/globals.css`, `public/img/*` |

Shared, already written (import freely): `@/lib/gsap`, `@/lib/utils`, `@/store/ui`, `@/store/cart`, `@/data/brand`, `@/data/products`, `@/components/ui/*`.

## Contracts between agents (build to these even if the other side isn't written yet)

### system provides (mounted in `layout.tsx`, in this order)
`<SmoothScroll/>` (Lenis + `ScrollTrigger.update` on the gsap ticker + `lagSmoothing(0)`) · `<Cursor/>` · `<Preloader/>` · `<Header/>` · `<Menu/>` · `<CartDrawer/>` (imported from `@/components/shop/CartDrawer`, default export, **shop** writes it) · `<PageTransition>` wrapping `{children}` · `<Footer/>` after `{children}`.
- `useUI` (`@/store/ui`): `introDone` flips true when the preloader ends (or immediately if skipped: reduced motion, or already played this session via `sessionStorage`). `menuOpen`, `cartOpen`, `transitioning`.
- Header: fixed, `mix-blend-difference` paper text so it reads on ink *and* paper *and* photos. Left: STRUCT wordmark (Monument) → `/`. Centre: live Tokyo clock in Bitcount (`TYO 14:32:07`). Right: `BAG (n)` (opens cart: `useUI.setCartOpen(true)`; n from `useCart(cartCount)`) and `MENU` / `CLOSE` toggle.
- Menu: full-viewport ink panel that **drops from the top over the whole page** and retracts on close (see BRAND §7). Items: `01 INDEX /`, `02 DROP-01 /drop-01`, `03 PEOPLE /people`. Locks scroll while open (`lenis.stop()`), Esc closes, focus is trapped.
- Cursor: small datum `+` that follows the pointer; elements with `data-cursor="LABEL"` grow it into a labelled ring. Adds `has-cursor` class on `<html>` only for fine pointers.
- Footer: giant `STRUCT` wordmark (Monument, ~full-width), nav, node list, newsletter-style "DROP ALERT" field (non-functional), live clock, and the `BRAND.disclosure` line. Footer is `tone-noir`.
- `ScrollTrigger.refresh()` after the preloader ends and after route transitions settle.

### three provides (`src/components/three/`)
All are `"use client"`, self-contained, fill their parent (`absolute inset-0` unless `className` overrides), pause when off-screen, and lazy-load three.
- `HeroScene` (default export, no props): the hero object — an architectural cluster of white monolith blocks with black edge lines (echoing the studio set in the photographs), slow drift + pointer parallax, soft studio lighting. White/ink/grey only; at most one signal-orange datum.
- `LoadRibbon` (default export, optional `className`): a twisted Möbius ribbon, black with a white load line down its centre, that rotates with pointer/scroll. For the "Method" section.
- `ObjectStage` (default export): `props { kind: "ring" | "slab" | "cluster" | "ribbon" | "dots"; tone?: "noir" | "blanc"; className?: string; }` — small decorative objects for other sections (drop reveal, shop hero, people page).
- `src/components/home/NodesSection.tsx` (default export, no props): full "Nodes" section for `/` — `cobe` dotted globe (monochrome, orange markers), draggable, auto-rotating, plus the 8 nodes from `@/data/brand` as a list; hovering/clicking a city rotates the globe to it and shows its live local time + role. Section is `tone-noir`.
- Real GLB assets only if CC0/CC-BY and recorded in `docs/CREDITS.md`; otherwise procedural.

### home provides
`src/app/page.tsx` composing, in order: Hero → Manifesto → Method (FORM / FOLLOWS / FUNCTION + LoadRibbon) → Origin (timeline + horizontal Field Studies archive) → `NodesSection` → DropReveal (COLLECTION → DROP-01 zoom, carried over from the original build) → **Suit01Reveal** (the big reveal, last section before the footer; ends with a CTA to `/drop-01`).

### shop provides
`/drop-01` (hero with DROP-01 status/units/countdown, filter by cut/colourway, product grid), `/drop-01/[slug]` (gallery, size select, add to bag, accordions: pieces, material, why it's sold whole, sizing, shipping), `CartDrawer` (default export from `@/components/shop/CartDrawer`; reads `useUI.cartOpen`), mock checkout panel that clearly says it is fictional. `generateStaticParams` from `PRODUCTS`.

### people provides
`/people`: hero, the four co-founders (**tight head-and-shoulder crops only** — the SUIT-01 garment must stay out of frame/unreadable on this page; render them as dot-matrix portraits drawn on canvas from the photo's luminance, and let a pointer "lens" (tap on touch) resolve the real photograph through the dots), their lines, the studio rules, the extended crew list, the nodes strip. Carry over the original build's hover idea: hovering a portrait swaps the giant "STRUCTS" word for that person's name, character by character from the centre (dot-glyph flicker → lock).

## Verification the lead will run afterwards
`npx tsc --noEmit`, `npx eslint src`, `next build`, then browser screenshots of `/`, `/drop-01`, `/drop-01/suit-01-noir-men`, `/people` at 1440 and 390, and a console-error check.
