import type { Garment, Layer } from "@/data/drop";

/** All DROP-01 photographs are 2400 x 1309 landscape, subject centred. */
export const IMG_W = 2400;
export const IMG_H = 1309;
export const imgSrc = (key: string) => `/img/${key}.webp`;

/** Stock below this shows the signal dot. */
export const LOW_STOCK = 25;
export const isLow = (g: Garment) => g.units.remaining > 0 && g.units.remaining < LOW_STOCK;
export const isSoldOut = (g: Garment) => g.units.remaining <= 0;

export const fmtPrice = (g: Garment) =>
  `$${g.price.usd.toLocaleString("en-US")} · ¥${g.price.jpy.toLocaleString("en-US")}`;

export const LAYER_LABEL: Record<Layer, string> = { outer: "OUTER", mid: "MID", base: "BASE" };

/**
 * The photographs are landscape; a portrait frame shows only the centre strip (~44% of the width). To stay sharp
 * the browser must fetch the image at roughly frame width x 2.3, so `sizes` is scaled up accordingly.
 */
export const CARD_SIZES = "(min-width: 1024px) 58vw, (min-width: 640px) 100vw, 112vw";
export const GALLERY_SIZES = "(min-width: 768px) 115vw, 190vw";

export const MATERIAL_COPY: Record<string, string> = {
  "3L NYLON": "Three-layer waterproof nylon, bonded and seam-taped. Matte face, dry hand, no membrane noise.",
  "HEAVY COTTON": "Heavyweight matte cotton, dense enough to hold a shoulder line. It washes down and does not wash out.",
  "FRENCH TERRY": "Dense French terry knit with a flat loop back. It keeps the hood upright without lining or wire.",
  "TECH JERSEY": "Moisture-wicking technical jersey with a cool, dry surface. Cut on the grain so the seam stays straight.",
  "COMPRESSION KNIT": "Zoned compression knit, mapped across the torso and sleeve. Matte stealth finish, no print, no gloss.",
  "GORE-TEX PRO": "Gore-Tex Pro three-layer laminate. Fully waterproof and windproof, taped at every seam.",
  "RIGID CANVAS": "Rigid cotton canvas, heavier than workwear. It starts stiff, softens at the folds and keeps its panels.",
  "HEAVY WOOL": "Heavyweight structured wool, felted on one face. It carries its own weight and falls straight.",
};

export const FIT_COPY: Record<Layer, string> = {
  outer: "Cut to sit over a mid layer. Take your usual size for a structured fit; size up one for room underneath. The model is 183 cm and wears M.",
  mid: "Cut to sit between base and outer. True to size, with a deliberate boxy shoulder. The model is 183 cm and wears M.",
  base: "Cut close to the body. True to size; size up one if you want it to sit away from the skin. The model is 183 cm and wears M.",
};

export const SHIPPING_COPY = [
  "Ships from Tokyo in 3 to 5 working days. STRUCT is a fictional brand: nothing here is real and nothing ships.",
  "Spot clean or cold wash inside out. Do not tumble dry, do not bleach. Press with a cloth on low heat.",
];
