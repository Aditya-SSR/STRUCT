"use client";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { resolveSplit } from "@/lib/resolveText";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import { useUI } from "@/store/ui";
import { NODES, BRAND } from "@/data/brand";
import TransitionLink from "@/components/ui/TransitionLink";
import { Clock } from "./Clock";
import { NAV, CONTACT, isActive } from "./nav";

const FOCUSABLE = "#site-header a[href], #site-header button, #site-menu a[href], #site-menu button";

/**
 * Full-page DROP-DOWN menu. An ink panel drops from the top over the whole page (resolve ease) and retracts
 * upward on close. Items are revealed with the RESOLVE text language, hairlines draw, hover inverts the row.
 * Esc closes · focus is trapped (header + panel; page content is inert) · scroll is locked while open.
 */
export default function Menu() {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    (_c, contextSafe) => {
      const el = root.current;
      if (!el || !contextSafe) return;
      const inner = el.querySelector<HTMLElement>("[data-inner]")!;
      const rvs = gsap.utils.toArray<HTMLElement>("[data-rv]", el);
      const rules = gsap.utils.toArray<HTMLElement>("[data-rule]", el);
      const wipes = gsap.utils.toArray<HTMLElement>("[data-wipe]", el);
      const reduced = () => prefersReducedMotion();

      gsap.set(el, { yPercent: -100, visibility: "hidden" });

      let tween: gsap.core.Tween | null = null;
      let fx: gsap.core.Timeline | null = null;
      let splits: { split: SplitText; cleanup: () => void }[] = [];
      let lastFocus: HTMLElement | null = null;

      const setInert = (on: boolean) => {
        ["main", "site-footer"].forEach((id) => {
          const n = document.getElementById(id);
          if (!n) return;
          if (on) n.setAttribute("inert", "");
          else n.removeAttribute("inert");
        });
      };

      const clearSplits = () => {
        splits.forEach(({ split, cleanup }) => {
          cleanup();
          split.revert();
        });
        splits = [];
        gsap.set(rvs, { clearProps: "visibility,position" });
      };

      const open = contextSafe(() => {
        tween?.kill();
        fx?.kill();
        clearSplits();
        lastFocus = document.activeElement as HTMLElement | null;
        lockScroll("menu");
        setInert(true);
        gsap.set(el, { visibility: "visible" });
        el.scrollTop = 0;

        if (reduced()) {
          gsap.set(el, { yPercent: 0 });
          gsap.set(rules, { scaleX: 1 });
          gsap.set(wipes, { clipPath: "inset(0 0 0 0)" });
          gsap.set(rvs, { visibility: "visible" });
        } else {
          tween = gsap.to(el, { yPercent: 0, duration: 1, ease: "resolve" });
          fx = gsap.timeline();
          fx.fromTo(inner, { yPercent: -14 }, { yPercent: 0, duration: 1.1, ease: "resolve" }, 0);
          fx.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power4.inOut", stagger: 0.07 }, 0.4);
          fx.fromTo(wipes, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power4.inOut", stagger: 0.1 }, 0.9);
          // RESOLVE text reveal: giant items first (with scan head), then the side column
          gsap.set(rvs, { visibility: "hidden" });
          rvs.forEach((n, i) => {
            const big = n.dataset.rv === "item";
            const split = SplitText.create(n, { type: "lines,words,chars" });
            gsap.set(n, { visibility: "visible" });
            const { cleanup } = resolveSplit(n, split, {
              delay: 0.5 + (big ? i * 0.07 : 0.35 + i * 0.03),
              speed: big ? 1.15 : 2,
              head: big,
            });
            splits.push({ split, cleanup });
          });
        }
        const first = el.querySelector<HTMLElement>("a[href]");
        first?.focus({ preventScroll: true });
      });

      const close = contextSafe(() => {
        tween?.kill();
        fx?.kill();
        unlockScroll("menu");
        setInert(false);
        const back = () => {
          gsap.set(el, { visibility: "hidden" });
          clearSplits();
          gsap.set(rules, { scaleX: 0 });
        };
        if (reduced()) {
          gsap.set(el, { yPercent: -100 });
          back();
        } else {
          tween = gsap.to(el, { yPercent: -100, duration: 0.9, ease: "resolve", onComplete: back });
          fx = gsap.timeline();
          fx.to(inner, { yPercent: 10, duration: 0.9, ease: "resolve" }, 0);
        }
        const toggle = document.querySelector<HTMLElement>('[aria-controls="site-menu"]');
        (lastFocus && document.contains(lastFocus) && lastFocus !== document.body ? lastFocus : toggle)?.focus({ preventScroll: true });
      });

      const onKey = (e: KeyboardEvent) => {
        const st = useUI.getState();
        if (!st.menuOpen || st.cartOpen) return; // the bag drawer owns Esc/Tab while it is open
        if (e.key === "Escape") {
          e.preventDefault();
          useUI.getState().setMenuOpen(false);
          return;
        }
        if (e.key !== "Tab") return;
        const list = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => !n.hasAttribute("disabled"));
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !list.includes(active as HTMLElement))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !list.includes(active as HTMLElement))) {
          e.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", onKey);

      const unsub = useUI.subscribe((s, p) => {
        if (s.menuOpen === p.menuOpen) return;
        if (s.menuOpen) open();
        else close();
      });

      return () => {
        unsub();
        document.removeEventListener("keydown", onKey);
        unlockScroll("menu");
        setInert(false);
        clearSplits();
      };
    },
    { scope: root },
  );

  const closeIfSame = (href: string) => () => {
    if (href === pathname) useUI.getState().setMenuOpen(false);
  };

  return (
    <div
      ref={root}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="tone-noir fixed inset-0 z-[60] overflow-hidden"
      style={{ visibility: "hidden" }}
    >
      <div
        data-inner
        data-lenis-prevent
        className="pad-x h-full overflow-y-auto overscroll-contain pb-6 pt-[calc(var(--header-h)+1rem)] md:grid md:grid-cols-12 md:gap-x-[var(--gutter)] md:pb-8"
      >
        {/* primary navigation */}
        <nav aria-label="Primary" className="md:col-span-8 md:self-center">
          <ul className="group/list relative">
            <li aria-hidden className="relative h-px">
              <span data-rule className="absolute inset-0 origin-left bg-paper/30" />
            </li>
            {NAV.map((item) => {
              const active = isActive(pathname, item.path);
              return (
                <li
                  key={item.href}
                  className="relative transition-opacity duration-500 group-hover/list:opacity-30 hover:opacity-100! focus-within:opacity-100!"
                >
                  <TransitionLink
                    href={item.href}
                    onClick={closeIfSame(item.href)}
                    data-cursor="OPEN"
                    aria-current={active ? "page" : undefined}
                    className="group/item relative flex items-center gap-4 overflow-hidden px-3 py-4 text-paper! transition-colors duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] hover:text-ink! focus-visible:text-ink! focus-visible:outline-none! md:gap-8 md:px-5 md:py-5"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 translate-y-full bg-paper transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/item:translate-y-0 group-focus-visible/item:translate-y-0"
                    />
                    <span className="relative flex w-9 flex-col items-start gap-1.5 self-start pt-[0.5em] md:w-20">
                      <span data-rv="meta" className="t-dots block text-[0.9375rem] md:text-xl">
                        {item.n}
                      </span>
                      <span data-rv="meta" className="t-label hidden text-[0.625rem] opacity-70 md:block">
                        {item.path}
                      </span>
                    </span>
                    <span
                      data-rv="item"
                      className="relative block min-w-0 flex-1 whitespace-nowrap font-display text-[clamp(2.25rem,7.4vw,9rem)] uppercase leading-[0.95] tracking-[-0.045em]"
                    >
                      {item.label}
                    </span>
                    <span
                      aria-hidden
                      className="relative -translate-x-3 text-2xl opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:opacity-100 md:text-4xl"
                    >
                      →
                    </span>
                    {active && <span aria-hidden className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 bg-signal" />}
                  </TransitionLink>
                  <span aria-hidden className="absolute bottom-0 left-0 right-0 block h-px">
                    <span data-rule className="absolute inset-0 origin-left bg-paper/30" />
                  </span>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* side column */}
        <aside className="mt-10 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-8 md:col-span-4 md:mt-0 md:flex md:flex-col md:justify-between md:self-stretch md:py-6">
          <div className="col-span-2 md:order-1">
            <p data-rv="meta" className="t-label mb-3! block text-paper/60">
              NODES / {String(NODES.length).padStart(2, "0")}
            </p>
            <ul className="grid grid-cols-2 gap-x-[var(--gutter)] gap-y-1.5">
              {NODES.map((n, i) => (
                <li key={n.id} className="flex items-baseline gap-2">
                  <span className="t-dots text-xs text-paper/50" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span data-rv="meta" className="t-label block">
                    {n.city}
                  </span>
                  {n.origin && <span aria-label="origin" className="ml-1 inline-block h-1.5 w-1.5 bg-signal" />}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:order-2">
            <p data-rv="meta" className="t-label mb-2! block text-paper/60">
              LOCAL TIME
            </p>
            <p data-wipe className="t-dots text-[1.75rem] md:text-[2.25rem]" suppressHydrationWarning>
              <Clock prefix="TYO " />
            </p>
          </div>

          <div className="md:order-3">
            <p data-rv="meta" className="t-label mb-2! block text-paper/60">
              CONTACT
            </p>
            <a href={`mailto:${CONTACT}`} data-cursor="WRITE" className="t-label block w-fit underline decoration-paper/30 underline-offset-4 hover:decoration-signal">
              <span data-rv="meta" className="block">
                {CONTACT}
              </span>
            </a>
          </div>

          <div className="col-span-2 md:order-4">
            <p data-rv="meta" className="t-h3 block">
              {BRAND.tagline}
            </p>
            <p data-rv="meta" className="t-label mt-4! block text-paper/60">
              (c) STRUCT 2026
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
