"use client";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { NODES } from "@/data/brand";
import SplitReveal from "@/components/ui/SplitReveal";
import { Corners, Fig } from "@/components/ui/Datum";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn, pad } from "@/lib/utils";

// cobe + the globe controller load only when the section is rendered on the client
const NodesGlobe = dynamic(() => import("@/components/three/NodesGlobe"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full" />,
});

/* ── one shared 1 Hz tick for every clock (0 on the server → "--:--:--", so no hydration mismatch) ── */
const listeners = new Set<() => void>();
let tick = 0;
let timer: number | undefined;
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) {
    tick = Date.now();
    timer = window.setInterval(() => {
      tick = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) window.clearInterval(timer);
  };
}
const useTick = () => useSyncExternalStore(subscribe, () => tick, () => 0);

const formatters = new Map<string, Intl.DateTimeFormat>();
function clock(tz: string, now: number) {
  let f = formatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    formatters.set(tz, f);
  }
  return f.format(now);
}

function Clock({ tz, className }: { tz: string; className?: string }) {
  const now = useTick();
  return (
    <time className={cn("t-dots tabular-nums", className)} suppressHydrationWarning>
      {now ? clock(tz, now) : "--:--:--"}
    </time>
  );
}

const fmtCoord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}  ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;

const STATS: Array<[string, string]> = [
  ["8", "NODES"],
  ["3", "CONTINENTS"],
  ["1", "TEMPLATE"],
];

/** §05 — Nodes. A dotted, draggable globe + the eight nodes with live local time. */
export default function NodesSection() {
  const root = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string>(NODES[0].id);
  const [focusSeq, setFocusSeq] = useState(0);
  const active = NODES.find((n) => n.id === activeId) ?? NODES[0];

  const select = useCallback((id: string) => {
    setActiveId(id);
    setFocusSeq((n) => n + 1);
  }, []);

  // the load lines under each row draw themselves (no text animation here — names reveal via SplitReveal)
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".node-rule", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.3,
        stagger: 0.07,
        ease: "expo.out",
        scrollTrigger: { trigger: ".node-list", start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="nodes" data-header-tone="dark" aria-label="Nodes" className="tone-noir relative overflow-clip py-[clamp(5rem,11vw,10rem)]">
      <div className="pad-x">
        <div className="flex items-center justify-between gap-6 border-b border-paper/15 pb-4 text-paper/70">
          <SplitReveal as="span" className="t-label" speed={2} head={false}>
            §06 — NODES
          </SplitReveal>
          <SplitReveal as="span" className="t-label hidden sm:block" speed={2} head={false}>
            SYS.STATUS: ACTIVE // 08 NODES
          </SplitReveal>
        </div>

        <div className="grid-12 mt-[clamp(3rem,7vw,6rem)] gap-y-14">
          {/* copy */}
          <div className="col-span-12 flex flex-col gap-8 lg:col-span-5 lg:row-start-1 lg:gap-10">
            <SplitReveal as="h2" className="t-h2">
              EIGHT NODES. ONE ROOM.
            </SplitReveal>
            <SplitReveal as="p" className="t-body max-w-[34rem] text-paper/75" speed={1.6} head={false}>
              Seven more studios opened in one year — not stores first, nodes: small, identical rooms with a cutting table, a mirror and a north window. Tokyo is the origin; the rest are mirrored copies of it. A node exists to resolve locally: pattern and fit are re-checked on local bodies before a drop ships to that region.
            </SplitReveal>
            <div role="group" aria-label="8 nodes, 3 continents, 1 template" className="flex gap-[clamp(1.5rem,4vw,3.5rem)] border-t border-paper/15 pt-6">
              {STATS.map(([n, label]) => (
                <div key={label} className="flex flex-col gap-3">
                  <SplitReveal as="span" className="t-dots block text-[clamp(2.75rem,5vw,4.5rem)]" head={false}>
                    {n}
                  </SplitReveal>
                  <SplitReveal as="span" className="t-label block text-paper/60" speed={2} head={false}>
                    {label}
                  </SplitReveal>
                </div>
              ))}
            </div>
          </div>

          {/* globe */}
          <div className="sticky top-[3.75rem] z-10 col-span-12 bg-ink pb-2 lg:top-[9vh] lg:z-auto lg:bg-transparent lg:pb-0 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-start">
            <Corners className="mx-auto w-full max-w-[min(46rem,40svh)] p-3 sm:p-5 sm:max-w-[min(46rem,60svh)] lg:max-w-[min(46rem,calc(86svh-1.5rem))]" size={12}>
              <NodesGlobe nodes={NODES} activeId={activeId} focusSeq={focusSeq} />
              <div className="pointer-events-none absolute left-3 top-3 text-paper/70 sm:left-5 sm:top-5">
                <Fig>FIG. 05 — NODE MAP</Fig>
              </div>
              <div className="pointer-events-none absolute right-3 top-3 hidden text-right text-paper/50 t-label sm:right-5 sm:top-5 sm:block">
                DRAG TO ROTATE
              </div>
              <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1 sm:bottom-5 sm:left-5" aria-live="polite">
                <span className="t-label text-paper">
                  {pad(NODES.indexOf(active) + 1)} {active.city}
                </span>
                <span className="t-label text-paper/60">{fmtCoord(active.lat, active.lon)}</span>
              </div>
            </Corners>
          </div>

          {/* node list */}
          <div className="col-span-12 lg:col-span-5 lg:row-start-2">
            <ul className="node-list border-t border-paper/15">
              {NODES.map((n, i) => {
                const on = n.id === activeId;
                return (
                  <li key={n.id} className="relative">
                    <button
                      type="button"
                      aria-pressed={on}
                      onMouseEnter={() => select(n.id)}
                      onFocus={() => select(n.id)}
                      onClick={() => select(n.id)}
                      className="block w-full text-left"
                    >
                      {/* padding/colour live on the inner box: the global `button` reset is unlayered and would beat utilities */}
                      <div
                        className={cn(
                          "grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 py-4 transition-colors duration-500 md:py-5",
                          on ? "text-paper" : "text-paper/50 hover:text-paper",
                        )}
                      >
                        <span className="t-dots pt-1 text-sm">{pad(i + 1)}</span>
                        <SplitReveal as="span" className="font-display block whitespace-nowrap text-[clamp(1.05rem,1.55vw,1.5rem)] uppercase leading-none tracking-[-0.02em]" speed={2} head={false}>
                          {n.city}
                        </SplitReveal>
                        <Clock tz={n.tz} className="text-base" />
                        <span className="t-label col-span-2 col-start-2 row-start-2 opacity-70">{n.role}</span>
                      </div>
                    </button>
                    <span aria-hidden className="node-rule absolute bottom-0 left-0 h-px w-full bg-paper/15" />
                    <span
                      aria-hidden
                      className={cn(
                        "absolute bottom-0 left-0 h-px w-full origin-left bg-paper transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)]",
                        on ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
