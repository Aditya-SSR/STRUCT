"use client";
import { useCallback } from "react";
import { useCart, lineQty, MAX_PER_LINE } from "@/store/cart";
import { useUI } from "@/store/ui";
import type { Garment } from "@/data/drop";

export type AddResult = "added" | "limit" | "soldout";

/** One place that adds a DROP-01 garment to the bag and opens the drawer. */
export function useAddGarment() {
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  return useCallback(
    (g: Garment, size: string): AddResult => {
      if (g.units.remaining <= 0) return "soldout";
      if (lineQty(useCart.getState(), g.sku, size) >= MAX_PER_LINE) {
        setCartOpen(true);
        return "limit";
      }
      add({
        sku: g.sku,
        slug: g.slug,
        title: g.name,
        image: g.images[0],
        size,
        usd: g.price.usd,
        jpy: g.price.jpy,
        href: `/drop-01/${g.slug}`,
        kind: "drop",
      });
      setCartOpen(true);
      return "added";
    },
    [add, setCartOpen],
  );
}
