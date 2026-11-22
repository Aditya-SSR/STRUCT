"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { TIMELINE } from "@/data/brand";
import { pad } from "@/lib/utils";
import { Datum, Fig } from "@/components/ui/Datum";
import LoadLine from "@/components/ui/LoadLine";
import GateReveal from "./parts/GateReveal";
import ScrollReveal from "./parts/ScrollReveal";
import Plate from "./parts/Plate";
import { flickerSwap } from "./parts/flicker";

const N = TIMELINE.length;
const clamp01 = gsap.utils.clamp(0, 1);

/** the load line between two years: a hairline that is drawn as you scroll, with a signal arrowhead on its tip */
function Connector({ axis }: { axis: "h" | "v" }) {
  const h = axis === "h";
  return (
    <div
      data-conn={axis}
      aria-hidden
      className={
        h
          ? "absolute left-full top-0 hidden h-full w-[var(--conn)] md:block"
          : "relative ml-[2px] block h-20 w-3 shrink-0 md:hidden"
      }
    >
      <div
        data-line
        className={h ? "absolute left-0 top-1/2 h-px w-full origin-left bg-current" : "absolute left-[5px] top-0 h-full w-px origin-top bg-current"}
        style={{ transform: h ? "scaleX(0)" : "scaleY(0)" }}
      />
      <svg
        data-head
        width="10"
        height="10"
        viewBox="0 0 10 10"
        className={`absolute text-signal ${h ? "left-0 top-1/2 -mt-[5px]" : "left-[1px] top-0"}`}
        style={{ opacity: 0 }}
      >
        <path d="M0 0L10 5L0 10Z" fill="currentColor" transform={h ? undefined : "rotate(90 5 5)"} />
      </svg>
    </div>
  );
}

/**
 * §04.1 — OUR JOURNEY. A header, then the field log: desktop pins and scrolls sideways, but only 2019 is on show
 * at first — the load line to the next year draws as you scroll, and each year resolves in only when the line reaches it.
 * Mobile: a vertical list, each entry resolves as it scrolls in, joined by a vertical load line. Reduced motion: static list.
 */
export default function Timeline() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const yearEl = useRef<HTMLSpanElement>(null);
  const opened = useRef<Set<number>>(new Set());
  const [seen, setSeen] = useState<boolean[]>(() => TIMELINE.map(() => false));

  useGSAP(
    () => {
      const section = root.current;
      const st = stage.current;
      const tr = track.current;
      if (!section || !st || !tr) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-entry]", tr);

      let motion = true;
      const readout = (animate: boolean) => {
        const top = Math.max(0, ...opened.current);
        const idx = opened.current.size ? top : 0;
        const c = counter.current;
        const y = yearEl.current;
        if (!c || !y) return;
        const a = `${pad(idx + 1)} / ${pad(N)}`;
        const b = TIMELINE[idx].year;
        if (animate && motion) {
          flickerSwap(c, a);
          flickerSwap(y, b);
        } else {
          c.textContent = a;
          y.textContent = b;
        }
      };
      const open = (i: number) => {
        if (opened.current.has(i)) return;
        opened.current.add(i);
        setSeen((s) => (s[i] ? s : s.map((v, k) => (k === i ? true : v))));
        readout(true);
      };
      readout(false);

      const mm = gsap.matchMedia();
      mm.add({ all: "(min-width: 0px)", motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 768px)" }, (ctx) => {
        const c = ctx.conditions as { motion: boolean; desktop: boolean };
        motion = c.motion;
        const vConns = gsap.utils.toArray<HTMLElement>('[data-conn="v"]', tr);
        const hConns = gsap.utils.toArray<HTMLElement>('[data-conn="h"]', tr);
        const draw = (conn: HTMLElement, p: number, horizontal: boolean) => {
          const len = horizontal ? conn.offsetWidth : conn.offsetHeight;
          gsap.set(conn.querySelector("[data-line]"), horizontal ? { scaleX: p } : { scaleY: p });
          gsap.set(conn.querySelector("[data-head]"), horizontal ? { x: p * len - 10, opacity: p > 0.001 ? 1 : 0 } : { y: p * len - 10, opacity: p > 0.001 ? 1 : 0 });
        };

        // reduced motion: a static list, everything shown
        if (!c.motion) {
          section.setAttribute("data-static", "");
          hConns.forEach((el) => gsap.set(el, { display: "none" }));
          vConns.forEach((el) => draw(el, 1, false));
          cards.forEach((_, i) => open(i));
          return () => section.removeAttribute("data-static");
        }

        // mobile: vertical list — an entry resolves as it scrolls in; the line to the next one draws with the scroll
        if (!c.desktop) {
          const sts: ScrollTrigger[] = [];
          cards.forEach((card, i) => {
            sts.push(ScrollTrigger.create({ trigger: card, start: "top 82%", once: true, onEnter: () => open(i) }));
          });
          vConns.forEach((el) => {
            sts.push(
              ScrollTrigger.create({
                trigger: el,
                start: "top 90%",
                end: "bottom 62%",
                onUpdate: (s) => draw(el, s.progress, false),
                onRefresh: (s) => draw(el, s.progress, false),
              }),
            );
          });
          return () => sts.forEach((s) => s.kill());
        }

        // desktop: pinned, scrolls sideways. A year is revealed only once the line before it has been drawn to it.
        const dist = () => Math.max(0, tr.scrollWidth - st.clientWidth);
        const update = () => {
          const vw = st.clientWidth;
          hConns.forEach((el, i) => {
            const r = el.getBoundingClientRect();
            const left = r.left - st.getBoundingClientRect().left;
            const w = r.width;
            const p = clamp01((vw * 0.9 - left) / (vw * 0.12 + w));
            draw(el, p, true);
            if (p >= 0.97 && opened.current.has(i)) open(i + 1);
          });
        };
        const reveal0 = ScrollTrigger.create({ trigger: st, start: "top 68%", onEnter: () => open(0), onRefresh: (s) => s.progress > 0 && open(0) });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: update,
          scrollTrigger: {
            trigger: st,
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: update,
          },
        });
        tl.to(tr, { x: () => -dist() }, 0).fromTo(bar.current, { scaleX: 0.02 }, { scaleX: 1 }, 0);
        update();
        return () => reveal0.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Plate ref={root} id="timeline" num="04.1" label="OUR JOURNEY — 2019 / 2026" tone="blanc" frame={false} className="group">
      {/* header — shown before the years */}
      <header className="pad-x pb-[clamp(3rem,6vw,5.5rem)] pt-[calc(var(--header-h)+clamp(4.5rem,9vw,8rem))]">
        <Fig>
          <ScrollReveal as="span" head={false} speed={2}>
            FIG. 04.1 — THE FIELD LOG
          </ScrollReveal>
        </Fig>
        <div className="mt-6">
          <ScrollReveal as="h2" className="t-h1" speed={1}>
            OUR JOURNEY
          </ScrollReveal>
        </div>
        <div className="relative mt-10">
          <LoadLine className="w-full opacity-40" duration={1.6} />
          <Datum className="absolute -left-[5.5px] -top-[5px]" />
          <Datum className="absolute -right-[5.5px] -top-[5px]" />
          <div className="mt-4 flex items-center justify-between gap-6 opacity-70">
            <ScrollReveal as="span" head={false} speed={2} className="t-label">
              {`${pad(N)} ENTRIES — ${TIMELINE[0].year} / ${TIMELINE[N - 1].year}`}
            </ScrollReveal>
            <ScrollReveal as="span" head={false} speed={2} className="t-label">
              SCROLL — ONE YEAR AT A TIME
            </ScrollReveal>
          </div>
        </div>
      </header>

      {/* the log */}
      <div ref={stage} className="relative overflow-hidden md:h-svh md:min-h-[600px] md:group-data-[static]:h-auto">
        <div className="flex h-full flex-col pb-14 pt-6 md:pb-12 md:pt-[calc(var(--header-h)+24px)] md:group-data-[static]:pt-6">
          <div
            ref={track}
            className="relative flex flex-1 flex-col px-[var(--margin)] pb-4 [--conn:clamp(4.5rem,10vw,9rem)] md:w-max md:flex-row md:items-stretch md:pb-0 md:pr-[22vw] md:group-data-[static]:w-auto md:group-data-[static]:flex-col md:group-data-[static]:pr-[var(--margin)]"
          >
            {TIMELINE.map((t, i) => (
              <div key={t.year + t.title} className="contents">
                <article
                  data-entry
                  className={`relative flex flex-col justify-between gap-8 pt-5 md:w-[min(52vw,780px)] md:shrink-0 md:gap-8 md:group-data-[static]:w-full ${i < N - 1 ? "md:mr-[var(--conn)] md:group-data-[static]:mr-0" : ""}`}
                >
                  <div
                    data-rule
                    aria-hidden
                    className="absolute left-0 top-0 h-px w-full origin-left bg-current/25 transition-transform duration-[1100ms] ease-[cubic-bezier(.76,0,.24,1)]"
                    style={{ transform: seen[i] ? "scaleX(1)" : "scaleX(0)" }}
                  />
                  <div className="flex items-center justify-between">
                    <GateReveal open={seen[i]} as="span" head={false} speed={2} className="t-label">
                      {`${pad(i + 1)} / ${pad(N)} — ${t.place.toUpperCase()}`}
                    </GateReveal>
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 bg-current transition-transform duration-300"
                      style={{ transform: seen[i] ? "scale(1)" : "scale(0)" }}
                    />
                  </div>
                  {/* the year row: the load line to the next year leaves from the middle of this row */}
                  <div className="relative md:flex md:flex-1 md:items-center">
                    <GateReveal
                      open={seen[i]}
                      as="p"
                      speed={0.8}
                      className={`t-dots whitespace-nowrap ${t.year.length > 4 ? "text-[clamp(2.75rem,min(9.4vw,15svh),9.5rem)]" : "text-[clamp(3.5rem,min(15vw,22svh),15rem)]"}`}
                    >
                      {t.year}
                    </GateReveal>
                    {i < N - 1 && <Connector axis="h" />}
                  </div>
                  <div className="flex max-w-[46ch] flex-col gap-4">
                    <GateReveal open={seen[i]} as="h3" speed={1.2} className="font-display text-[clamp(1.4rem,min(2.8vw,4.6svh),3rem)] uppercase leading-[0.98] tracking-[-0.035em]">
                      {t.title}
                    </GateReveal>
                    <GateReveal open={seen[i]} as="p" speed={1.6} className="t-body opacity-70">
                      {t.body}
                    </GateReveal>
                  </div>
                </article>
                {i < N - 1 && <Connector axis="v" />}
              </div>
            ))}
          </div>

          {/* progress — a load line with one tick per year, the live index and year */}
          <div className="pad-x mt-8 hidden md:block md:group-data-[static]:hidden" aria-hidden>
            <div className="mb-3 flex items-baseline justify-between">
              <span ref={counter} className="t-dots text-[clamp(1rem,1.4vw,1.35rem)]">{`01 / ${pad(N)}`}</span>
              <span ref={yearEl} className="t-label whitespace-nowrap opacity-60">{TIMELINE[0].year}</span>
            </div>
            <div className="relative h-px w-full bg-current/15">
              <div ref={bar} className="absolute inset-0 origin-left bg-current" style={{ transform: "scaleX(0.02)" }} />
              {TIMELINE.map((t, i) => (
                <span
                  key={t.year + t.title}
                  className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-current transition-opacity duration-300"
                  style={{ left: `${(i / (N - 1)) * 100}%`, opacity: seen[i] ? 1 : 0.25 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Plate>
  );
}
