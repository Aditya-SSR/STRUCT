"use client";
import Image from "next/image";
import TransitionLink from "@/components/ui/TransitionLink";
import { useUI } from "@/store/ui";
import { useCart, MAX_PER_LINE, type CartLine } from "@/store/cart";

const btn =
  "flex h-9 w-9 items-center justify-center border hairline font-mono text-lg outline-offset-2 transition-colors duration-300 hover:bg-paper hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-paper";

/** One bag line (suit or drop garment): thumbnail, title, size, qty stepper (capped), remove. */
export default function CartLineRow({ line }: { line: CartLine }) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const href = line.href ?? `/suit-01/${line.slug}`;
  const atMax = line.qty >= MAX_PER_LINE;
  return (
    <li className="flex gap-4 border-b hairline py-5">
      <div className="relative h-28 w-[84px] shrink-0 border hairline bg-bone">
        <Image src={`/img/${line.image}.webp`} alt={line.title} fill sizes="84px" className={`object-cover ${line.kind === "suit" ? "object-[50%_12%]" : "object-center"}`} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <TransitionLink href={href} data-cursor="VIEW" onClick={() => setCartOpen(false)} className="t-h3 block text-[0.9rem] leading-tight outline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
            {line.title}
          </TransitionLink>
          <p className="t-label mt-2 text-ash">SIZE {line.size}{line.kind === "suit" ? " · SOLD WHOLE" : ""}</p>
          <p className="t-label mt-1 text-ash">
            ${(line.usd * line.qty).toLocaleString("en-US")} · ¥{(line.jpy * line.qty).toLocaleString("en-US")}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center" role="group" aria-label={`Quantity for ${line.title}, size ${line.size}`}>
            <button type="button" className={btn} aria-label="Decrease quantity" onClick={() => setQty(line.sku, line.size, line.qty - 1)} data-cursor="−">
              −
            </button>
            <span className="t-dots -mx-px flex h-9 min-w-9 items-center justify-center border hairline px-2 text-lg" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              className={btn}
              aria-label={atMax ? `Increase quantity (limit ${MAX_PER_LINE} reached)` : "Increase quantity"}
              disabled={atMax}
              onClick={() => setQty(line.sku, line.size, line.qty + 1)}
              data-cursor="+"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(line.sku, line.size)}
            aria-label={`Remove ${line.title}, size ${line.size}`}
            className="t-label text-ash underline-offset-4 outline-offset-2 hover:text-paper hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
          >
            REMOVE
          </button>
        </div>
      </div>
    </li>
  );
}
