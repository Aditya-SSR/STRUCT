"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SplitReveal from "@/components/ui/SplitReveal";

export type AccordionItem = { id: string; title: string; lines: string[] };

/** One open at a time, height tweened with GSAP. Collapsed panels are `inert`. First panel starts open. */
export default function DropAccordion({ items, initial = null }: { items: AccordionItem[]; initial?: string | null }) {
  const root = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(initial);
  const booted = useRef(false);
  // bumps every time a panel opens so its copy replays the RESOLVE (before the first open it is plain text)
  const [gen, setGen] = useState<Record<string, number>>({});

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", root.current);
      const quick = prefersReducedMotion() || !booted.current;
      panels.forEach((el) => {
        const open = el.dataset.panel === openId;
        gsap.to(el, { height: open ? "auto" : 0, duration: quick ? 0 : open ? 0.85 : 0.6, ease: "power4.inOut", overwrite: true });
      });
      booted.current = true;
    },
    { scope: root, dependencies: [openId] },
  );

  return (
    <div ref={root} className="hairline border-t">
      {items.map((it) => {
        const open = openId === it.id;
        return (
          <div key={it.id} className="hairline border-b">
            <h3>
              <button
                type="button"
                id={`acc-${it.id}-btn`}
                aria-expanded={open}
                aria-controls={`acc-${it.id}`}
                onClick={() => {
                  if (!open) setGen((g) => ({ ...g, [it.id]: (g[it.id] ?? 0) + 1 }));
                  setOpenId(open ? null : it.id);
                }}
                data-cursor={open ? "CLOSE" : "OPEN"}
                className="flex w-full items-center justify-between gap-4 py-4 text-left outline-offset-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
              >
                <span className="t-label">{it.title}</span>
                <span aria-hidden className="relative block h-[11px] w-[11px]">
                  <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
                  <span
                    className={`absolute left-1/2 top-0 h-full w-px bg-current transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                      open ? "scale-y-0" : "scale-y-100"
                    }`}
                  />
                </span>
              </button>
            </h3>
            <div
              id={`acc-${it.id}`}
              data-panel={it.id}
              role="region"
              aria-labelledby={`acc-${it.id}-btn`}
              inert={!open}
              className="overflow-hidden"
              style={{ height: it.id === initial ? "auto" : 0 }}
            >
              <div key={`${it.id}-${gen[it.id] ?? 0}`} className="space-y-2 pb-5 pr-6">
                {it.lines.map((line, i) =>
                  (gen[it.id] ?? 0) === 0 ? (
                    <p key={i} className="t-body text-smoke">
                      {line}
                    </p>
                  ) : (
                    <SplitReveal key={i} as="p" when="mount" head={false} speed={1.8} delay={i * 0.12} className="t-body text-smoke">
                      {line}
                    </SplitReveal>
                  ),
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
