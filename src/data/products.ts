/** SUIT-01 — a SEPARATE product from DROP-01 (the eight garments live in src/data/drop.ts). Four SKUs, sold whole. */

export type Cut = "men" | "women";
export type Colorway = "noir" | "blanc";

export type Product = {
  sku: string;
  slug: string;
  name: string; // "SUIT-01"
  colorway: Colorway;
  cut: Cut;
  title: string; // "SUIT-01 / NOIR / MEN"
  price: { usd: number; jpy: number };
  units: { total: number; remaining: number };
  /** /public/img keys (no extension). First is the hero/card image. */
  images: string[];
  /** where the head sits in images[0] for tight crops (CSS object-position) */
  focus: string;
  sizes: string[];
  blurb: string;
};

export const SUIT_RELEASE = {
  id: "SUIT-01",
  releasedISO: "2026-11-21T12:00:00+09:00",
  released: "21 NOV 2026 — 12:00 JST",
  totalUnits: 400,
  restock: false,
  status: "LIVE",
} as const;

export const SUIT = {
  name: "SUIT-01",
  tagline: "The first complete structure.",
  /** What is sold. Boots in the photographs are styling, not included. */
  pieces: [
    { n: "01", name: "COAT", body: "Long, asymmetric single closure. Load-line piping runs from collar to cuff." },
    { n: "02", name: "TUNIC", body: "Crossover front, asymmetric hem. The inner layer the coat was cut against." },
    { n: "03", name: "TROUSER", body: "Wide leg, twin outer load lines, tension straps at the knee." },
    { n: "04", name: "BELT", body: "Matte, single buckle. Where the three lines meet." },
  ],
  material: "3-layer matte wool-nylon twill, woven in Okayama. Load lines are bonded 12 mm grosgrain tape, seam-sealed.",
  care: "Dry clean only. Hang the coat. Do not press the load lines.",
  whySoldWhole:
    "The white tape that starts at the shoulder of the coat is still running when it reaches the ankle of the trouser. Take one piece away and the line breaks. So we don't sell parts.",
  sizing: "XS–XL. Resolved on 2,400 bodies across eight nodes. Women's and men's cuts are patterned separately.",
  shipping: "Ships from the nearest node in 5–8 working days. (Fictional — nothing ships.)",
};

const PRICE = { usd: 1240, jpy: 189000 };
const SIZES = ["XS", "S", "M", "L", "XL"];

export const PRODUCTS: Product[] = [
  {
    sku: "ST01-MN", slug: "suit-01-noir-men", name: "SUIT-01", colorway: "noir", cut: "men",
    title: "SUIT-01 / NOIR / MEN", price: PRICE, units: { total: 100, remaining: 38 },
    images: ["suit-m-black-a", "suit-m-black-b", "suit-m-black-walk", "group-low-a"], focus: "50% 12%", sizes: SIZES,
    blurb: "Black body, white load lines. Cut for the shoulder that carries a bag.",
  },
  {
    sku: "ST01-MB", slug: "suit-01-blanc-men", name: "SUIT-01", colorway: "blanc", cut: "men",
    title: "SUIT-01 / BLANC / MEN", price: PRICE, units: { total: 100, remaining: 61 },
    images: ["suit-m-white", "group-close", "group-low-b", "pair"], focus: "50% 12%", sizes: SIZES,
    blurb: "White body, black load lines. The same structure, inverted.",
  },
  {
    sku: "ST01-WN", slug: "suit-01-noir-women", name: "SUIT-01", colorway: "noir", cut: "women",
    title: "SUIT-01 / NOIR / WOMEN", price: PRICE, units: { total: 100, remaining: 17 },
    images: ["suit-f-black", "group-low-c", "group-wide-c", "pair"], focus: "50% 8%", sizes: SIZES,
    blurb: "Black body, white load lines. Patterned separately for the women's frame.",
  },
  {
    sku: "ST01-WB", slug: "suit-01-blanc-women", name: "SUIT-01", colorway: "blanc", cut: "women",
    title: "SUIT-01 / BLANC / WOMEN", price: PRICE, units: { total: 100, remaining: 54 },
    images: ["suit-f-white", "group-low-a", "group-close", "group-wide-a"], focus: "50% 12%", sizes: SIZES,
    blurb: "White body, black load lines. Light, exact, unmistakable.",
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

/** Shared studio imagery for the SUIT-01 reveal and the people page (no product attached). */
export const STUDIO_IMAGES = {
  wide: ["group-wide-a", "group-wide-b", "group-wide-c"],
  low: ["group-low-a", "group-low-b", "group-low-c"],
  close: "group-close",
  pair: "pair",
};
