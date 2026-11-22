"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import Button from "@/components/ui/Button";
import SplitReveal from "@/components/ui/SplitReveal";
import { useUI } from "@/store/ui";
import { useCart, cartCount, cartSubtotalUSD, cartSubtotalJPY, makeOrderNumber, MAX_PER_LINE, type CartLine } from "@/store/cart";
import CartLineRow from "./CartLineRow";
import CheckoutPanel from "./CheckoutPanel";
import { useModalBehavior } from "./useModalBehavior";

type View = "bag" | "checkout" | "done";
type Order = { no: string; lines: CartLine[]; usd: number; jpy: number };

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const jpy = (n: number) => `¥${n.toLocaleString("en-US")}`;

/**
 * The bag. Slides in from the right over everything (z-80: above header 70 and menu 60).
 * Bag → fictional checkout → confirmation, all inside the drawer. Mounted once by the layout.
 */
export default function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const lines = useCart((s) => s.lines);
  const count = useCart(cartCount);
  const subUSD = useCart(cartSubtotalUSD);
  const subJPY = useCart(cartSubtotalJPY);
  const clear = useCart((s) => s.clear);

  const root = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const everOpened = useRef(false);

  const [view, setView] = useState<View>("bag");
  const [order, setOrder] = useState<Order | null>(null);
  const [announce, setAnnounce] = useState("");
  // every open remounts the body, so its headings RESOLVE again each time the bag slides in
  const [gen, setGen] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setGen((g) => g + 1);
      setView("bag");
    }
  }

  const close = useCallback(() => setCartOpen(false), [setCartOpen]);
  useModalBehavior(open, panel, close, closeBtn);

  // aria-live: say what was added
  useEffect(
    () =>
      useCart.subscribe((s, prev) => {
        if (cartCount(s) <= cartCount(prev)) return;
        const added = s.lines.find((l) => {
          const before = prev.lines.find((p) => p.sku === l.sku && p.size === l.size);
          return !before || l.qty > before.qty;
        });
        if (added) setAnnounce(`Added ${added.title}, size ${added.size}. ${cartCount(s)} in bag.`);
      }),
    [],
  );

  // slide in / out
  useGSAP(
    () => {
      const r = root.current;
      const p = panel.current;
      const b = backdrop.current;
      if (!r || !p || !b) return;
      if (!open && !everOpened.current) {
        // GSAP owns the transform from the start (a React inline translateX(100%) gets parsed into px and sticks)
        gsap.set(p, { xPercent: 100, x: 0 });
        return;
      }
      const quick = prefersReducedMotion();
      if (open) {
        everOpened.current = true;
        gsap.set(r, { visibility: "visible" });
        gsap.fromTo(b, { opacity: 0 }, { opacity: 1, duration: quick ? 0 : 0.6, ease: "power2.out" });
        gsap.fromTo(p, { xPercent: 100, x: 0 }, { xPercent: 0, x: 0, duration: quick ? 0 : 0.9, ease: "power4.inOut" });
      } else {
        gsap.to(b, { opacity: 0, duration: quick ? 0 : 0.6, ease: "power2.inOut" });
        gsap.to(p, {
          xPercent: 100,
          duration: quick ? 0 : 0.8,
          ease: "power4.inOut",
          onComplete: () => {
            gsap.set(r, { visibility: "hidden" });
          },
        });
      }
    },
    { scope: root, dependencies: [open] },
  );

  const place = () => {
    setOrder({ no: makeOrderNumber(), lines: lines.map((l) => ({ ...l })), usd: subUSD, jpy: subJPY });
    clear();
    setView("done");
  };

  const title = view === "bag" ? "THE BAG" : view === "checkout" ? "CHECKOUT" : "ORDER PLACED";

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {announce}
      </div>
      <div ref={root} className="fixed inset-0 z-[80]" style={{ visibility: "hidden" }} inert={!open} aria-hidden={!open}>
        <button
          ref={backdrop}
          type="button"
          tabIndex={-1}
          aria-label="Close bag"
          onClick={close}
          data-cursor="CLOSE"
          className="absolute inset-0 h-full w-full bg-ink/60"
          style={{ opacity: 0 }}
        />
        <aside
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Bag"
          tabIndex={-1}
          className="tone-noir absolute right-0 top-0 flex h-[100dvh] w-full max-w-[480px] flex-col border-l hairline outline-none"
        >
          <header className="flex items-center justify-between gap-4 border-b hairline px-[var(--margin)] py-5 md:px-8">
            <div key={`${gen}-${view}`} className="flex items-baseline gap-3">
              <SplitReveal as="h2" when="mount" speed={1.4} head={false} className="t-h3">
                {title}
              </SplitReveal>
              {view === "bag" && <span className="t-dots text-lg">({count})</span>}
            </div>
            <button
              ref={closeBtn}
              type="button"
              onClick={close}
              data-cursor="CLOSE"
              className="t-label border hairline px-3 py-2 outline-offset-2 transition-colors duration-300 hover:bg-paper hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            >
              CLOSE ✕
            </button>
          </header>

          <div key={gen} className="flex min-h-0 flex-1 flex-col">
            {view === "bag" && <BagView lines={lines} subUSD={subUSD} subJPY={subJPY} onCheckout={() => setView("checkout")} onClose={close} />}
            {view === "checkout" && lines.length > 0 && (
              <CheckoutPanel usd={subUSD} jpy={subJPY} onBack={() => setView("bag")} onPlace={place} />
            )}
            {view === "done" && order && <Confirmation order={order} onClose={close} />}
          </div>
        </aside>
      </div>
    </>
  );
}

function BagView({
  lines,
  subUSD,
  subJPY,
  onCheckout,
  onClose,
}: {
  lines: CartLine[];
  subUSD: number;
  subJPY: number;
  onCheckout: () => void;
  onClose: () => void;
}) {
  if (!lines.length) {
    return (
      <div className="flex flex-1 flex-col justify-between px-[var(--margin)] py-10 md:px-8">
        <div>
          <SplitReveal as="p" when="mount" delay={0.2} className="t-h2">
            NOTHING CARRIED YET.
          </SplitReveal>
          <SplitReveal as="p" when="mount" delay={0.5} speed={1.6} head={false} className="t-body mt-6 max-w-[34ch] text-ash">
            Eight single garments in DROP-01. One whole-body structure in SUIT-01. Nothing in the bag yet.
          </SplitReveal>
        </div>
        <div onClick={onClose}>
          <div className="flex flex-col gap-3">
            <Button href="/drop-01" tone="paper" variant="line" className="w-full" data-cursor="VIEW">
              SEE DROP-01
            </Button>
            <Button href="/suit-01" tone="paper" variant="line" className="w-full" data-cursor="VIEW">
              SEE SUIT-01
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <ul data-modal-scroll data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto px-[var(--margin)] md:px-8">
        {lines.map((l) => (
          <CartLineRow key={`${l.sku}-${l.size}`} line={l} />
        ))}
      </ul>
      <div className="border-t hairline px-[var(--margin)] py-5 md:px-8">
        <dl className="space-y-2">
          <div className="flex items-baseline justify-between">
            <dt className="t-label">SUBTOTAL</dt>
            <dd className="t-dots text-xl">{usd(subUSD)}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="t-label text-ash">IN YEN</dt>
            <dd className="t-dots text-lg text-ash">{jpy(subJPY)}</dd>
          </div>
        </dl>
        <p className="t-label mt-4 text-smoke">LIMIT {MAX_PER_LINE} PER SIZE. NO RESTOCK.</p>
        <Button type="button" tone="paper" variant="solid" onClick={onCheckout} data-cursor="GO" className="mt-4 w-full">
          CHECKOUT
        </Button>
      </div>
    </>
  );
}

function Confirmation({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <>
      <div data-modal-scroll data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto px-[var(--margin)] py-8 md:px-8">
        <p className="t-label text-ash">ORDER NUMBER</p>
        <p className="t-dots mt-2 text-5xl" aria-label={`Order number ${order.no}`}>
          {order.no}
        </p>
        <SplitReveal as="p" when="mount" delay={0.3} speed={1.6} head={false} className="t-body mt-6 max-w-[36ch] text-ash">
          The structure is resolved. It is also imaginary: STRUCT is a fictional brand, no payment was taken and nothing will ship.
        </SplitReveal>
        <ul className="mt-8 border-t hairline">
          {order.lines.map((l) => (
            <li key={`${l.sku}-${l.size}`} className="flex items-baseline justify-between gap-4 border-b hairline py-3">
              <span className="t-label">
                {l.title} · {l.size} × {l.qty}
              </span>
              <span className="t-label text-ash">{usd(l.usd * l.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="t-dots mt-5 text-xl">
          {usd(order.usd)} · {jpy(order.jpy)}
        </p>
      </div>
      <div className="border-t hairline px-[var(--margin)] py-4 md:px-8">
        <Button type="button" tone="paper" variant="solid" onClick={onClose} className="w-full" data-cursor="CLOSE">
          CONTINUE
        </Button>
      </div>
    </>
  );
}
