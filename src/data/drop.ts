/**
 * DROP-01 — the EIGHT GARMENTS. (Names, SKUs, materials, prices, descriptions and specs are the founder's
 * originals from the first STRUCT build.) SUIT-01 is a SEPARATE product — see src/data/products.ts.
 *
 * A drop = a fixed number of units, released once, never restocked.
 */

export type Layer = "outer" | "mid" | "base";

export type Garment = {
  /** OBJ.01 … OBJ.08 — the founder's original SKU scheme */
  sku: string;
  slug: string;
  name: string; // "GRID LINE JACKET"
  material: string; // "3L NYLON"
  layer: Layer;
  colour: "noir" | "blanc";
  price: { usd: number; jpy: number };
  units: { total: number; remaining: number };
  /** /public/img keys (no extension): [front, side] */
  images: [string, string];
  blurb: string;
  description: string;
  specs: string[];
  sizes: string[];
};

export const DROP = {
  id: "DROP-01",
  number: "01",
  title: "EIGHT GARMENTS",
  releasedISO: "2026-11-14T12:00:00+09:00",
  released: "14 NOV 2026 — 12:00 JST",
  garments: 8,
  unitsPerGarment: 100,
  totalUnits: 800,
  restock: false,
  status: "LIVE",
  statusLine: "SYS.STATUS: ACTIVE // NODE 01",
} as const;

const jpy = (usd: number) => Math.round((usd * 150) / 1000) * 1000;
const SIZES = ["S", "M", "L", "XL"];

export const GARMENTS: Garment[] = [
  {
    sku: "OBJ.01", slug: "grid-line-jacket", name: "GRID LINE JACKET", material: "3L NYLON", layer: "outer", colour: "noir",
    price: { usd: 799, jpy: jpy(799) }, units: { total: 100, remaining: 64 }, images: ["study-01a", "study-01b"], sizes: SIZES,
    blurb: "A shell with a skeleton of white seams.",
    description:
      "Architectural outer shell crafted from 3-layer waterproof nylon. Features a geometric skeletal grid defined by high-contrast white technical seams.",
    specs: ["3-Layer Waterproof Nylon", "Laser-Cut Grid Seams", "Concealed Front Zip", "Asymmetrical Hemline"],
  },
  {
    sku: "OBJ.02", slug: "base-layer", name: "BASE LAYER", material: "HEAVY COTTON", layer: "base", colour: "blanc",
    price: { usd: 520, jpy: jpy(520) }, units: { total: 100, remaining: 88 }, images: ["study-02a", "study-02b"], sizes: SIZES,
    blurb: "The structural foundation piece.",
    description:
      "Structural full-sleeve foundation piece. Engineered from heavy-weight matte cotton with articulated geometric elbow panels.",
    specs: ["100% Heavyweight Cotton", "Articulated Elbow Paneling", "Raised Mock Neck", "Seamless Laser-Cut Cuffs"],
  },
  {
    sku: "OBJ.03", slug: "struct-hoodie", name: "STRUCT HOODIE", material: "FRENCH TERRY", layer: "mid", colour: "noir",
    price: { usd: 450, jpy: jpy(450) }, units: { total: 100, remaining: 41 }, images: ["study-03a", "study-03b"], sizes: SIZES,
    blurb: "A hood that holds its own shape.",
    description:
      "Monolithic hooded sweatshirt. Constructed with an oversized, self-supporting rigid hood and seamless side-entry pockets.",
    specs: ["Dense French Terry Knit", "Rigid Geometric Hood", "Hidden Side-Seam Pockets", "Cropped Structural Fit"],
  },
  {
    sku: "OBJ.04", slug: "asym-line-tee", name: "ASYM LINE TEE", material: "TECH JERSEY", layer: "base", colour: "noir",
    price: { usd: 399, jpy: jpy(399) }, units: { total: 100, remaining: 93 }, images: ["study-04a", "study-04b"], sizes: SIZES,
    blurb: "One continuous seam across the shoulder.",
    description:
      "Essential technical t-shirt with an aggressive architectural cut. Defined by a singular continuous white seam line traversing the shoulder.",
    specs: ["Moisture-Wicking Tech Jersey", "Continuous Contrast Seam", "Asymmetrical Split Hem", "Boxy Brutalist Fit"],
  },
  {
    sku: "OBJ.05", slug: "stealth-base-top", name: "STEALTH BASE TOP", material: "COMPRESSION KNIT", layer: "base", colour: "noir",
    price: { usd: 800, jpy: jpy(800) }, units: { total: 100, remaining: 22 }, images: ["study-05a", "study-05b"], sizes: SIZES,
    blurb: "Skin-tight, with a built-in funnel mask.",
    description:
      "Tactical skin-tight base layer featuring an integrated lower-face mask. Engineered with moisture-wicking compression knit.",
    specs: ["Integrated Funnel Mask", "Zoned Compression Mapping", "Extended Sleeves w/ Thumbholes", "Matte Stealth Finish"],
  },
  {
    sku: "OBJ.06", slug: "tactical-cargo", name: "TACTICAL CARGO", material: "GORE-TEX PRO", layer: "outer", colour: "noir",
    price: { usd: 799, jpy: jpy(799) }, units: { total: 100, remaining: 57 }, images: ["study-06a", "study-06b"], sizes: SIZES,
    blurb: "Stealth shell with built-in chest volume.",
    description:
      "Military-inspired stealth shell jacket. Features deeply structured oversized cargo chest pockets integrated seamlessly into the front panels.",
    specs: ["Gore-Tex Pro Weatherproofing", "Integrated 3D Chest Pockets", "High-Coverage Funnel Collar", "Articulated Sleeves"],
  },
  {
    sku: "OBJ.07", slug: "modular-vest", name: "MODULAR VEST", material: "RIGID CANVAS", layer: "mid", colour: "blanc",
    price: { usd: 999, jpy: jpy(999) }, units: { total: 100, remaining: 9 }, images: ["study-07a", "study-07b"], sizes: SIZES,
    blurb: "A sleeveless harness of intersecting panels.",
    description:
      "Sleeveless structural utility harness. Built from rigid cotton canvas featuring intersecting asymmetrical chest panels.",
    specs: ["Heavyweight Rigid Canvas", "Modular Chest Paneling", "Hidden Zip Utility Compartments", "Adjustable Nylon Side Straps"],
  },
  {
    sku: "OBJ.08", slug: "monolith-coat", name: "MONOLITH COAT", material: "HEAVY WOOL", layer: "outer", colour: "noir",
    price: { usd: 700, jpy: jpy(700) }, units: { total: 100, remaining: 71 }, images: ["study-08a", "study-08b"], sizes: SIZES,
    blurb: "A floor-length wall of wool.",
    description:
      "Massive floor-length architectural overcoat. Crafted from heavy structured wool with an extreme funnel neck for total lower-face coverage.",
    specs: ["Heavyweight Structured Wool", "Extreme Funnel Neck Closure", "Concealed Monolithic Placket", "Floor-Length A-Line Silhouette"],
  },
];

export const getGarment = (slug: string) => GARMENTS.find((g) => g.slug === slug);
export const dropRemaining = () => GARMENTS.reduce((n, g) => n + g.units.remaining, 0);
export const dropClaimed = () => DROP.totalUnits - dropRemaining();
