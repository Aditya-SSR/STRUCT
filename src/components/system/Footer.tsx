"use client";
import { useState } from "react";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import TransitionLink from "@/components/ui/TransitionLink";
import Button from "@/components/ui/Button";
import { Datum } from "@/components/ui/Datum";
import { BRAND, NODES } from "@/data/brand";
import { getLenis } from "@/lib/lenis";
import { Clock } from "./Clock";
import HoverResolve from "./HoverResolve";
import { NAV, CONTACT } from "./nav";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal";

/** Site footer (tone-noir): drop alert, nav, nodes, studio, live clock, disclosure, and the giant STRUCT wordmark. */
export default function Footer() {
  const [sent, setSent] = useState(false);

  const toTop = () => {
    const l = getLenis();
    if (l) l.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="site-footer" className="tone-noir relative overflow-hidden pt-20 md:pt-32" aria-label="Site footer">
      <div className="pad-x">
        {/* top: drop alert + navigation */}
        <div className="grid-12 gap-y-14">
          <div className="col-span-12 md:col-span-6">
            <p className="t-label mb-6! flex items-center gap-2 text-paper/60">
              <Datum size={9} /> <span>§ END / SYS.STATUS: ACTIVE</span>
            </p>
            <SplitReveal as="h2" className="t-h2">
              DROP ALERT
            </SplitReveal>
            <SplitReveal as="p" className="t-body mt-5! max-w-[38ch] text-paper/70" speed={1.6} head={false} delay={0.2}>
              One message when the next structure opens. Fixed numbers, released once, never restocked.
            </SplitReveal>

            <form
              className="mt-8 max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <label htmlFor="drop-alert-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="drop-alert-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="EMAIL@ADDRESS"
                  onChange={() => sent && setSent(false)}
                  data-cursor="TYPE"
                  className="t-label min-h-[3.25rem] flex-1 border border-paper/40 bg-transparent px-4 text-paper outline-none transition-colors duration-300 placeholder:text-paper/40 focus:border-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                />
                <Button type="submit" tone="paper" variant="solid" className="min-h-[3.25rem]">
                  NOTIFY ME
                </Button>
              </div>
              <p role="status" className="t-label mt-3! min-h-[2.6em] text-paper/60">
                {sent ? "NOTED. THIS IS A DESIGN PROJECT: NOTHING WAS SENT." : ""}
              </p>
            </form>
          </div>

          <nav aria-label="Footer" className="col-span-12 md:col-span-5 md:col-start-8">
            <SplitReveal as="p" className="t-label mb-4! text-paper/60" speed={2} head={false}>
              INDEX
            </SplitReveal>
            <ul className="border-t border-paper/20">
              {NAV.map((item) => (
                <li key={item.href} className="border-b border-paper/20">
                  <TransitionLink
                    href={item.href}
                    data-cursor="GO"
                    className={`group/f flex items-baseline gap-4 py-4 font-display text-[clamp(1.5rem,3vw,2.75rem)] uppercase leading-none tracking-[-0.04em] transition-colors duration-500 hover:text-signal! ${focus}`}
                  >
                    <span className="t-dots w-8 text-[0.9375rem] text-paper/50">{item.n}</span>
                    <HoverResolve text={item.label} />
                    <span aria-hidden className="ml-auto -translate-x-2 text-xl opacity-0 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/f:translate-x-0 group-hover/f:opacity-100">
                      →
                    </span>
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <LoadLine className="mb-10 mt-16 w-full text-paper/25 md:mt-24" />

        {/* middle: nodes + studio + tagline */}
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-6">
            <SplitReveal as="h3" className="t-label mb-5! text-paper/60" speed={2} head={false}>
              NODES / 08
            </SplitReveal>
            <ul className="grid grid-cols-1 gap-x-[var(--gutter)] sm:grid-cols-2">
              {NODES.map((n, i) => (
                <li key={n.id} className="flex items-baseline gap-3 border-b border-paper/15 py-2.5">
                  <span className="t-dots w-6 text-xs text-paper/50" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="t-label">{n.city}</span>
                  {n.origin && <span aria-label="origin node" className="inline-block h-1.5 w-1.5 self-center bg-signal" />}
                  <span className="t-dots ml-auto text-sm text-paper/70">
                    <Clock tz={n.tz} seconds={false} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 sm:col-span-6 md:col-span-3">
            <SplitReveal as="h3" className="t-label mb-5! text-paper/60" speed={2} head={false}>
              STUDIO
            </SplitReveal>
            <p className="t-label leading-[1.9]">
              Kiba, Tokyo
              <br />
              {BRAND.coords}
            </p>
            <a
              href={`mailto:${CONTACT}`}
              data-cursor="WRITE"
              className={`t-label mt-4! block w-fit underline decoration-paper/30 underline-offset-4 transition-colors hover:decoration-signal ${focus}`}
            >
              {CONTACT}
            </a>
            <p className="t-dots mt-6! text-[1.75rem]" aria-label="Current time in Tokyo">
              <Clock prefix="TYO " />
            </p>
          </div>

          <div className="col-span-12 sm:col-span-6 md:col-span-3 md:text-right">
            <SplitReveal as="p" className="t-h3" delay={0.1}>
              {BRAND.tagline}
            </SplitReveal>
            <button
              type="button"
              onClick={toTop}
              data-cursor="TOP"
              className={`t-label mt-8! inline-flex items-center gap-2 text-paper/70 transition-colors hover:text-paper ${focus}`}
            >
              BACK TO TOP <span aria-hidden>↑</span>
            </button>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-paper/20 pt-5 md:flex-row md:items-start md:justify-between md:gap-10">
          <p className="t-label shrink-0 text-paper/70">(c) STRUCT 2026</p>
          <p className="text-[0.6875rem] leading-[1.7] text-paper/50 md:max-w-[62ch] md:text-right">{BRAND.disclosure}</p>
        </div>
      </div>

      {/* the giant wordmark */}
      <div className="pad-x mt-10 [container-type:inline-size] md:mt-16">
        <SplitReveal
          as="p"
          className="block whitespace-nowrap pb-[0.06em] font-display uppercase leading-[0.8] tracking-[-0.04em] text-[length:calc(100cqw/5.4)]"
          speed={0.7}
          head={false}
          start="top 99%"
        >
          STRUCT
        </SplitReveal>
      </div>
    </footer>
  );
}
