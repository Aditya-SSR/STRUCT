"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SplitReveal from "@/components/ui/SplitReveal";

export type AccordionItem = { id: string; title: string; lines: string[] };

/**
 * One open at a time. Height is tweened with GSAP; the copy inside RESOLVEs each time its panel opens.
 * (Before the first open the panel holds plain text, so nothing plays inside a collapsed panel.)
 */
export default function Accordion({ items, className = "" }: { items: AccordionItem[]; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  // bumps every time a panel opens: used as a key so its copy replays the RESOLVE
  const [gen, setGen] = useState<Record<string, number>>({});
  const booted = useRef(false);

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", root.current);
      const quick = prefersReducedMotion() || !booted.current;
      panels.forEach((el) => {
        const open = el.dataset.panel === openId;
        gsap.to(el, {
          height: open ? "auto" : 0,
          duration: quick ? 0 : open ? 0.85 : 0.6,
          ease: "power4.inOut",
          overwrite: true,
        });
      });
      booted.current = true;
    },
    { scope: root, dependencies: [openId] },
  );

  const toggle = (id: string) => {
    const closing = openId === id;
    if (!closing) setGen((g) => ({ ...g, [id]: (g[id] ?? 0) + 1 }));
    setOpenId(closing ? null : id);
  };

  return (
    <div ref={root} className={`border-t hairline ${className}`}>
      {items.map((it) => {
        const open = openId === it.id;
        const g = gen[it.id] ?? 0;
        return (
          <div key={it.id} className="border-b hairline">
            <h3>
              <button
                type="button"
                id={`acc-${it.id}-btn`}
                aria-expanded={open}
                aria-controls={`acc-${it.id}`}
                onClick={() => toggle(it.id)}
                data-cursor={open ? "CLOSE" : "OPEN"}
                className="group flex w-full items-center justify-between gap-4 py-4 text-left outline-offset-[-2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
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
              style={{ height: 0 }}
            >
              <div key={`${it.id}-${g}`} className="space-y-3 pb-5 pr-6">
                {it.lines.map((line, i) =>
                  g === 0 ? (
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
