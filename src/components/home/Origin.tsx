"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import ScrollReveal from "./parts/ScrollReveal";
import LoadLine from "@/components/ui/LoadLine";
import { Fig } from "@/components/ui/Datum";
import { BRAND } from "@/data/brand";
import Plate from "./parts/Plate";

/** The top floor of the rope factory in Kiba, drawn as a plan: rope-weight marks burned in the concrete, light from the north only. */
function FactoryPlan() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el.querySelectorAll("[data-draw]"),
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: "power4.inOut",
            stagger: 0.05,
            scrollTrigger: { trigger: el, start: "top 80%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const marks = [
    [90, 80], [150, 80], [210, 80], [270, 80], [330, 80],
    [90, 140], [150, 140], [210, 140], [270, 140], [330, 140],
    [90, 200], [150, 200], [210, 200],
  ];
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1, pathLength: 1, strokeDasharray: 1, strokeDashoffset: 0 } as const;
  return (
    <svg ref={ref} viewBox="0 0 420 300" role="img" aria-label="Plan of the top floor of the rope factory in Kiba, Tokyo" className="h-auto w-full">
      <path data-draw d="M40 40H380V260H40Z" {...stroke} />
      <path data-draw d="M40 40V260M380 40V260" {...stroke} opacity=".3" />
      {marks.map(([x, y]) => (
        <circle key={`${x}-${y}`} data-draw cx={x} cy={y} r="9" {...stroke} />
      ))}
      <path data-draw d="M40 282H380M40 276V288M380 276V288" {...stroke} />
      <path data-draw d="M210 20V4M204 10L210 4L216 10" {...stroke} />
      <circle cx="380" cy="40" r="3" fill="var(--signal)" />
      <g fill="currentColor" fontFamily="var(--font-space-mono), monospace" fontSize="8" letterSpacing=".08em">
        <text x="221" y="14">N — THE ONLY LIGHT</text>
        <text x="210" y="298" textAnchor="middle">↔ 1 FLOOR / 12 ROPE-WEIGHT MARKS</text>
        <text x="352" y="124" textAnchor="middle" opacity=".5">KIBA</text>
      </g>
    </svg>
  );
}

/** §04 — Origin. The week they quit, then the rule on the wall as a statement. tone-blanc. */
export default function Origin() {
  return (
    <Plate id="origin" num="04" label="ORIGIN — KIBA, TOKYO" tone="blanc" className="pad-x">
      {/* the week we quit */}
      <div className="grid-12 gap-y-14 pb-[clamp(5rem,12vw,10rem)] pt-[calc(var(--header-h)+clamp(4rem,8vw,7rem))]">
        <div className="col-span-12 md:col-span-6">
          <Fig>
            <ScrollReveal as="span" head={false} speed={2}>
              FIG. 04 — TOKYO, 2019
            </ScrollReveal>
          </Fig>
          <div className="mt-6">
            <ScrollReveal as="h2" className="t-h1" speed={1}>
              THE WEEK WE QUIT
            </ScrollReveal>
          </div>
          <div className="mt-10 flex max-w-[52ch] flex-col gap-6">
            <ScrollReveal as="p" className="t-lead" speed={1.5}>
              Four people who had never worked together resigned from four different design jobs in the same seven days. An architect. A pattern cutter. A textile engineer. A type designer.
            </ScrollReveal>
            <ScrollReveal as="p" className="t-body opacity-70" speed={1.6}>
              Each had the same reason, said four different ways: they were being asked to add something to a thing that was already finished. A print. A logo. A detail. Decoration laid over structure so it would look like it had an idea.
            </ScrollReveal>
            <ScrollReveal as="p" className="t-body opacity-70" speed={1.6}>
              They met on a Sunday in Kiba, on the top floor of a closed rope factory. The floor still had rope-weight marks burned into the concrete, and the light came from the north only. They stayed. The factory is the studio today.
            </ScrollReveal>
          </div>
        </div>
        <div className="col-span-12 md:col-span-5 md:col-start-8 md:self-end">
          <FactoryPlan />
          <div className="mt-3 flex items-center justify-between opacity-60">
            <span className="t-label">PLAN — TOP FLOOR</span>
            <span className="t-label">1 : 200</span>
          </div>
        </div>
      </div>

      {/* the rule on the wall */}
      <div className="relative pb-[clamp(5rem,12vw,10rem)]">
        <LoadLine className="w-full opacity-40" duration={1.8} />
        <div className="mt-6 flex items-center justify-between">
          <ScrollReveal as="span" head={false} speed={2} className="t-label">
            2020 — THE RULE ON THE WALL
          </ScrollReveal>
          <ScrollReveal as="span" head={false} speed={2} className="t-label opacity-60">
            REN, IN MARKER, ON A ROLL OF PATTERN PAPER
          </ScrollReveal>
        </div>
        <ScrollReveal
          as="h2"
          className="mt-10 font-display text-[clamp(2.4rem,9.4vw,11.5rem)] uppercase leading-[0.9] tracking-[-0.045em]"
          speed={0.9}
        >
          {BRAND.rule}
        </ScrollReveal>
        <div className="mt-10 flex items-end justify-between gap-8">
          <ScrollReveal as="p" className="t-body max-w-[40ch] opacity-70" speed={1.6}>
            That became the whole method. They call it KŌZŌ — structure. Load, line, resolve.
          </ScrollReveal>
          <span aria-hidden className="h-2 w-2 bg-signal" />
        </div>
      </div>
    </Plate>
  );
}
