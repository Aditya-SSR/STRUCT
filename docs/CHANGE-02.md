# CHANGE 02 — DROP-01 and SUIT-01 are two different products

**This brief supersedes `docs/BRAND.md` wherever they disagree.** Read it before anything else.

## The correction (from the founder)
- **DROP-01 = the EIGHT GARMENTS** (the founder's original STRUCT pieces: OBJ.01–OBJ.08). A *drop* is a fixed number of units released once, never restocked. DROP-01: 8 garments × 100 units = **800 units**, released **14 Nov 2026, 12:00 JST**. Each garment is sold individually (single pieces, sizes S–XL).
- **SUIT-01 = a SEPARATE product**: a full-body bundle (coat + tunic + trouser + belt) sold whole, in 4 SKUs (men/women × noir/blanc), 400 units, released **21 Nov 2026, 12:00 JST**. It is **not part of DROP-01**.
- The story: we spent years making eight garments (DROP-01). We were **bored of normal clothes** — ours included. So we invented SUIT-01.
- The eight are no longer "retired field studies" — there is no "RETIRED" stamp anywhere. They are live products.

## Routes
| Route | What |
|---|---|
| `/` | Home (landing — keep it, with the changes below) |
| `/drop-01`, `/drop-01/[slug]` | **NEW shop for the 8 garments** (`GARMENTS` in `src/data/drop.ts`) |
| `/suit-01`, `/suit-01/[slug]` | The suit shop — **moved from `/drop-01`** (`PRODUCTS` / `SUIT` in `src/data/products.ts`) |
| `/people` | The people |
Menu/nav (`src/components/system/nav.ts`, already updated): `01 INDEX · 02 DROP-01 · 03 SUIT-01 · 04 PEOPLE`.

## Data (already written by the lead — import, don't redefine)
- `src/data/drop.ts`: `DROP` (id, totalUnits 800, released…), `GARMENTS[]` (sku `OBJ.01`…, slug, name, material, layer `outer|mid|base`, colour, price `{usd,jpy}`, units, `images: [front, side]` keys in `/public/img` e.g. `study-01a`/`study-01b`, blurb, description, specs, sizes), `getGarment`, `dropRemaining()`, `dropClaimed()`. Prices are USD (the founder's original numbers) with ¥ = ×150 rounded.
- `src/data/products.ts`: SUIT only now. `DROP` was **removed** from it → use `SUIT_RELEASE` for the suit release info.
- `src/store/cart.ts`: `CartLine` now has optional `href` and `kind: "suit" | "drop"`. Every add-to-bag call must pass `href` (product page URL) and `kind`.
- `src/data/brand.ts`: `TIMELINE` copy already updated (7 entries). `STUDIES` is deprecated (home agents: migrate to `GARMENTS`; the lead deletes `STUDIES` at the end).
- All 16 garment images exist: `study-01a … study-08b`.

## Rules that still apply
Everything in `docs/ARCHITECTURE.md` (RESOLVE text reveal via `<SplitReveal>` for ALL text, TransitionLink, GSAP from `@/lib/gsap`, tokens, zero radius, orange `signal` accent only). Don't run `next dev/build` (lead's dev server is on :3000 — `curl` it; Playwright (headless Chromium) can be used for screenshots; write your own scripts under unique file names so agents don't collide; **scroll with `mouse.wheel` or gradual `scrollTo` steps, not teleports** — Lenis/scrub lag makes jumps look blank). Don't `npm install`. Only edit files you own. `npx tsc --noEmit` will show errors from *other* agents' in-progress files — ignore those, fix yours.
