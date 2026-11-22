"use client";
import TransitionLink from "@/components/ui/TransitionLink";
import { useUI } from "@/store/ui";
import { useCart, cartCount } from "@/store/cart";
import { Clock } from "./Clock";
import HoverResolve from "./HoverResolve";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal";

/**
 * Fixed header. `mix-blend-difference` + paper text so it reads on ink, paper and photographs.
 * Left: wordmark · centre: live Tokyo clock (md+) · right: BAG (n) + MENU/CLOSE.
 */
export default function Header() {
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const count = useCart(cartCount);

  return (
    <header
      id="site-header"
      className="pad-x fixed inset-x-0 top-0 z-[70] grid h-[var(--header-h)] grid-cols-[1fr_auto] items-center text-paper mix-blend-difference md:grid-cols-[1fr_auto_1fr]"
    >
      <TransitionLink
        href="/"
        aria-label="STRUCT — home"
        data-cursor="HOME"
        onClick={() => setMenuOpen(false)}
        className={`justify-self-start font-display text-[1.125rem] uppercase leading-none tracking-[-0.04em] md:text-[1.375rem] ${focus}`}
      >
        <HoverResolve text="STRUCT" />
      </TransitionLink>

      <div className="t-dots hidden text-[1.125rem] tracking-[0.02em] md:block" aria-label="Current time in Tokyo">
        <Clock prefix="TYO " />
      </div>

      <div className="flex items-center justify-self-end gap-6 md:gap-8">
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          data-cursor="BAG"
          className={`t-label flex items-center gap-1 text-[0.75rem] ${focus}`}
          aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
        >
          <HoverResolve text="BAG" />
          <span className="t-dots text-[0.9375rem]" aria-hidden>
            ({count})
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          data-cursor={menuOpen ? "CLOSE" : "MENU"}
          className={`t-label inline-flex min-w-[4.25rem] items-center justify-end gap-2 text-[0.75rem] ${focus}`}
        >
          <span aria-hidden className="relative block h-[11px] w-[11px]">
            <span
              className="absolute left-0 top-1/2 h-px w-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
              style={{ transform: menuOpen ? "rotate(45deg)" : "rotate(0deg)" }}
            />
            <span
              className="absolute left-1/2 top-0 h-full w-px bg-current transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
              style={{ transform: menuOpen ? "rotate(45deg)" : "rotate(0deg)" }}
            />
          </span>
          <HoverResolve key={menuOpen ? "close" : "menu"} text={menuOpen ? "CLOSE" : "MENU"} />
        </button>
      </div>
    </header>
  );
}
