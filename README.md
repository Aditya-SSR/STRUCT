# STRUCT

> **FORM FOLLOWS FUNCTION.** A fictional Tokyo clothing studio that builds garments like structures.
> DROP-01 — SUIT-01 — 400 units, sold whole. A design project: the people, places and numbers are invented, the imagery is AI-generated, and the shop never takes payment.

Rebuilt from scratch (the original STRUCT repo history is preserved in git).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all routes prerender statically)
```

## Pages

| Route | What it is |
|---|---|
| `/` | Preloader → hero → manifesto → FORM / FOLLOWS / FUNCTION → method → origin & field studies → nodes globe → drop zoom → **SUIT-01 reveal** → footer |
| `/drop-01`, `/drop-01/[slug]` | **DROP-01** — the eight garments (OBJ.01–OBJ.08), 800 units, product cards + quick add |
| `/suit-01`, `/suit-01/[slug]` | **SUIT-01** — the whole-body suit, sold whole (4 SKUs: men/women × noir/blanc), 400 units |
| `/people` | The four co-founders (dot-matrix portraits that resolve to photographs), studio rules, crew, nodes |

## Where things live

- `docs/BRAND.md` — the story, the people, the nodes, the identity (colour, type, motion, voice). **Start here.**
- `docs/ARCHITECTURE.md` — stack rules and the contracts between parts of the codebase.
- `docs/CREDITS.md` — libraries and licences.
- `src/data/` — all copy and product data (`brand.ts`, `products.ts`).
- `src/lib/resolveText.ts` + `src/components/ui/SplitReveal.tsx` — the signature **RESOLVE** text reveal. Every text reveal on the site uses it.
- `src/components/system/` — preloader, header, full-page drop-down menu, cursor, page transitions, footer.
- `src/components/three/` — procedural 3D (hero cluster, Möbius load ribbon, object stage) and the cobe globe.
- `public/img/` — processed photography (`manifest.json` lists sizes).

## Identity in one breath

Ink `#0A0A0A`, paper `#F3F4F2`, one signal colour `#FF5A00` used sparingly. Monument Extended for display, Bitcount (dot matrix) for numbers, Space Mono for everything else. Zero radius, hairlines, load lines that draw themselves.
