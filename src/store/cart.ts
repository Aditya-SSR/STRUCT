import { create } from "zustand";

export type CartLine = {
  sku: string;
  slug: string;
  title: string; // "SUIT-01 / NOIR / MEN" or "GRID LINE JACKET"
  /** product page for this line, e.g. /suit-01/suit-01-noir-men or /drop-01/grid-line-jacket */
  href?: string;
  /** which product family: suits are sold whole, drop garments are single pieces */
  kind?: "suit" | "drop";
  image: string; // /public/img key, no extension
  size: string;
  qty: number;
  usd: number;
  jpy: number;
};

type Cart = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (sku: string, size: string) => void;
  setQty: (sku: string, size: string, qty: number) => void;
  clear: () => void;
};

/** Suits are sold whole and units are scarce: cap any one line at 2. */
export const MAX_PER_LINE = 2;

export const useCart = create<Cart>((set) => ({
  lines: [],
  add: (line, qty = 1) =>
    set((s) => {
      const i = s.lines.findIndex((l) => l.sku === line.sku && l.size === line.size);
      if (i === -1) return { lines: [...s.lines, { ...line, qty: Math.min(qty, MAX_PER_LINE) }] };
      const lines = s.lines.slice();
      lines[i] = { ...lines[i], qty: Math.min(lines[i].qty + qty, MAX_PER_LINE) };
      return { lines };
    }),
  remove: (sku, size) => set((s) => ({ lines: s.lines.filter((l) => !(l.sku === sku && l.size === size)) })),
  setQty: (sku, size, qty) =>
    set((s) => ({
      lines: s.lines
        .map((l) => (l.sku === sku && l.size === size ? { ...l, qty: Math.max(0, Math.min(qty, MAX_PER_LINE)) } : l))
        .filter((l) => l.qty > 0),
    })),
  clear: () => set({ lines: [] }),
}));

/** Selectors (use: const count = useCart(cartCount)) */
export const cartCount = (s: Cart) => s.lines.reduce((n, l) => n + l.qty, 0);
export const cartSubtotalUSD = (s: Cart) => s.lines.reduce((n, l) => n + l.qty * l.usd, 0);
export const cartSubtotalJPY = (s: Cart) => s.lines.reduce((n, l) => n + l.qty * l.jpy, 0);

/** Quantity of one sku+size line already in the bag (0 if absent). */
export const lineQty = (s: Cart, sku: string, size: string) =>
  s.lines.find((l) => l.sku === sku && l.size === size)?.qty ?? 0;

/** A made-up, ST-0000 style order number for the fictional checkout. Call at click time, never during render. */
export const makeOrderNumber = () => "ST-" + String(1000 + Math.floor(Math.random() * 9000));
