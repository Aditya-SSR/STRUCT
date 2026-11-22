/** Canonical brand data. Source of truth is docs/BRAND.md — keep them in sync. */

export const BRAND = {
  name: "STRUCT",
  tagline: "FORM FOLLOWS FUNCTION",
  /** the one-sentence method, used as the studio rule */
  rule: "IF IT DOESN'T CARRY, CUT IT.",
  short: "Wear the structure.",
  founded: 2019,
  hq: { city: "Tokyo", ward: "Kiba, Kōtō-ku", lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
  coords: "35.6762° N / 139.6503° E",
  disclosure:
    "STRUCT is a fictional brand created for a design project. People, places and numbers are invented; imagery is AI-generated; no payment is ever taken.",
} as const;

export type Node = {
  id: string;
  city: string;
  country: string;
  role: string;
  lat: number;
  lon: number;
  origin?: boolean;
  /** local timezone for live clocks */
  tz: string;
  opened: number;
};

export const NODES: Node[] = [
  { id: "tyo", city: "Tokyo", country: "Japan", role: "Origin — HQ & Atelier", lat: 35.6762, lon: 139.6503, origin: true, tz: "Asia/Tokyo", opened: 2019 },
  { id: "osa", city: "Osaka", country: "Japan", role: "Pattern Lab", lat: 34.6937, lon: 135.5023, tz: "Asia/Tokyo", opened: 2026 },
  { id: "sel", city: "Seoul", country: "South Korea", role: "Textile Lab", lat: 37.5665, lon: 126.978, tz: "Asia/Seoul", opened: 2026 },
  { id: "sin", city: "Singapore", country: "Singapore", role: "South-East Asia node", lat: 1.3521, lon: 103.8198, tz: "Asia/Singapore", opened: 2026 },
  { id: "lon", city: "London", country: "United Kingdom", role: "Europe node", lat: 51.5074, lon: -0.1278, tz: "Europe/London", opened: 2026 },
  { id: "par", city: "Paris", country: "France", role: "Showroom", lat: 48.8566, lon: 2.3522, tz: "Europe/Paris", opened: 2026 },
  { id: "nyc", city: "New York", country: "United States", role: "Americas HQ & Flagship", lat: 40.7128, lon: -74.006, tz: "America/New_York", opened: 2026 },
  { id: "lax", city: "Los Angeles", country: "United States", role: "Fit Studio, West", lat: 34.0522, lon: -118.2437, tz: "America/Los_Angeles", opened: 2026 },
];

/** Face/figure focal points are CSS object-position values for the portrait images. */
export type Person = {
  id: string;
  name: string;
  native: string;
  role: string;
  discipline: string;
  background: string;
  line: string;
  /** /public/img key (no extension) — the full-length photograph */
  image: string;
  /** object-position for a head-and-shoulders crop of that image */
  focus: string;
  node: string;
  index: string;
};

export const PEOPLE: Person[] = [
  {
    id: "ren", name: "Ren Hasegawa", native: "長谷川 蓮", role: "Founder, Creative Director", discipline: "Architecture",
    background: "Structural architect. Left a firm in Osaka before his first building was finished.",
    line: "A line should be able to carry weight.",
    image: "suit-m-white", focus: "50% 12%", node: "Tokyo", index: "01",
  },
  {
    id: "mio", name: "Mio Takanashi", native: "高梨 澪", role: "Co-founder, Head of Pattern", discipline: "Pattern",
    background: "Third-generation tailor's family in Kanda. Cut her first coat at fourteen.",
    line: "I don't draw clothes. I draw where a body disagrees with cloth.",
    image: "suit-f-black", focus: "50% 8%", node: "Tokyo", index: "02",
  },
  {
    id: "kaito", name: "Kaito Mori", native: "森 海斗", role: "Co-founder, Head of Materials", discipline: "Textiles",
    background: "Textile engineer, formerly a technical-sailcloth mill in Kojima, Okayama.",
    line: "Cloth is a decision made by a thousand threads. Make it once, correctly.",
    image: "suit-m-black-a", focus: "50% 10%", node: "Tokyo", index: "03",
  },
  {
    id: "yuna", name: "Yuna Arai", native: "新井 ユナ", role: "Co-founder, Head of Systems", discipline: "Type & Systems",
    background: "Type designer. Built the dot-matrix system and every number on the site.",
    line: "A dot is the smallest structure that still says something.",
    image: "suit-f-white", focus: "50% 12%", node: "Tokyo", index: "04",
  },
];

export const CREW: { name: string; role: string; node: string }[] = [
  { name: "Sora Itō", role: "Production", node: "Osaka" },
  { name: "Jisoo Han", role: "Textile Lab", node: "Seoul" },
  { name: "Wei Jie Tan", role: "South-East Asia", node: "Singapore" },
  { name: "Eleanor Voss", role: "Europe", node: "London" },
  { name: "Camille Laurent", role: "Showroom", node: "Paris" },
  { name: "Marcus Bell", role: "Americas", node: "New York" },
  { name: "Dani Reyes", role: "Fit Studio", node: "Los Angeles" },
];

export const STUDIO_RULES = [
  { n: "01", rule: "If it doesn't carry, cut it." },
  { n: "02", rule: "Draw where the load travels. Nowhere else." },
  { n: "03", rule: "A garment alone is a part. Dress the body, not the hanger." },
  { n: "04", rule: "Make a fixed number. Make it once. Close the structure." },
  { n: "05", rule: "Every node is a copy of Tokyo. Resolve locally, ship from there." },
];

/** The three KŌZŌ steps. */
export const METHOD = [
  { n: "01", word: "LOAD", jp: "荷重", body: "Where does the body push on the cloth, and the cloth on the body? We map it before we touch a pencil." },
  { n: "02", word: "LINE", jp: "線", body: "We draw only where load travels. Every seam, panel and tape is a load line. If you can see it, it is working." },
  { n: "03", word: "RESOLVE", jp: "解", body: "We remove everything else. What is left is the garment. We don't design a piece — we resolve it." },
];

/** The words the manifesto pulls out (carried over from the original build: FORM / FOLLOWS / FUNCTION). */
export const MANIFESTO = {
  lines: [
    "We didn't like design.",
    "It kept asking us to add something to a thing that was already finished.",
    "So we stopped designing and started resolving.",
  ],
  principle: ["FORM", "FOLLOWS", "FUNCTION"],
  principleBody:
    "We treat the body as an architectural form. Every seam, joint and panel follows a code of absolute utility. We remove decoration until only function is left.",
};

export const TIMELINE = [
  { year: "2019", place: "Tokyo", title: "The Week We Quit", body: "An architect, a pattern cutter, a textile engineer and a type designer resign from four design jobs in the same seven days. They meet on a Sunday on the top floor of a closed rope factory in Kiba." },
  { year: "2020", place: "Tokyo", title: "The Rule on the Wall", body: "Ren writes one sentence on a roll of pattern paper and pins it up: IF IT DOESN'T CARRY, CUT IT. It becomes the method — KŌZŌ." },
  { year: "2021–25", place: "Tokyo", title: "Eight Garments", body: "A shell, a base layer, a hood, a tee, a masked top, a cargo shell, a vest, a coat. Each one made correctly, each one finished — and each one standing alone, asking what it was supposed to stand next to." },
  { year: "2025", place: "Tokyo", title: "The Suit Problem", body: "We were bored of normal clothes, ours included. \"We keep selling the beam and calling it the building.\" — Mio. The unit is the dressed body. So we invented SUIT-01: coat, tunic, trouser and belt, cut as one structure." },
  { year: "2026", place: "Seven cities", title: "The Nodes", body: "Seven mirrored studios open in one year: identical rooms, a cutting table, a mirror, a north window. Pattern and fit are resolved on local bodies." },
  { year: "2026", place: "Everywhere", title: "DROP-01", body: "The eight garments, released together. 800 units, 100 of each. Released 14 November, 12:00 JST. No restock." },
  { year: "2026", place: "Everywhere", title: "SUIT-01", body: "Sold separately, sold whole. One structure for the whole body: coat, tunic, trouser and belt. 400 units. Released 21 November, 12:00 JST." },
];
