"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart, lineQty, MAX_PER_LINE } from "@/store/cart";
import { useUI } from "@/store/ui";
import type { Product } from "@/data/products";

export type AddState = "idle" | "added";

/** ADD TO BAG: requires a size, adds via the cart store, opens the drawer, flashes the button state. */
export function useAddToBag(product: Product, size: string | null, onNeedSize?: () => void) {
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const [state, setState] = useState<AddState>("idle");
  // a message belongs to the size it was raised for: picking another size dismisses it
  const [msg, setMsg] = useState<{ text: string; size: string | null }>({ text: "", size: null });
  const message = msg.size === size ? msg.text : "";
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const submit = useCallback(() => {
    if (!size) {
      setMsg({ text: "SELECT A SIZE FIRST. SUIT-01 IS CUT TO SIZE.", size });
      onNeedSize?.();
      return;
    }
    const already = lineQty(useCart.getState(), product.sku, size);
    if (already >= MAX_PER_LINE) {
      setMsg({ text: `LIMIT ${MAX_PER_LINE} PER SIZE. IT IS ALREADY IN YOUR BAG.`, size });
      setCartOpen(true);
      return;
    }
    add({
      sku: product.sku,
      slug: product.slug,
      title: product.title,
      image: product.images[0],
      size,
      usd: product.price.usd,
      jpy: product.price.jpy,
      href: `/suit-01/${product.slug}`,
      kind: "suit",
    });
    setMsg({ text: "", size });
    setState("added");
    setCartOpen(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  }, [add, onNeedSize, product, setCartOpen, size]);

  return { state, message, submit };
}
