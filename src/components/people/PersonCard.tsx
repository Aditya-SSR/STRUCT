"use client";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { Person } from "@/data/brand";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import { Corners } from "@/components/ui/Datum";
import DotPortrait from "./DotPortrait";

/** One co-founder: index, dot-portrait with lens, name, native name, role, background, line. */
export default function PersonCard({ person, className = "" }: { person: Person; className?: string }) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  // the portrait is drawn like a load line: its frame opens from the bottom as it enters
  useGSAP(
    () => {
      const el = frame.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          clearProps: "clipPath",
        },
      );
    },
    { scope: root },
  );

  return (
    <article ref={root} className={`flex flex-col ${className}`} aria-label={person.name}>
      <div className="flex items-end justify-between pb-3">
        <span className="t-dots text-5xl md:text-6xl" aria-hidden>
          {person.index}
        </span>
        <SplitReveal className="t-label text-smoke" speed={2} head={false}>
          {person.discipline}
        </SplitReveal>
      </div>
      <LoadLine className="mb-4 w-full" />

      <div ref={frame}>
        <Corners inset={-6} size={12}>
          <DotPortrait person={person} />
        </Corners>
      </div>
      <SplitReveal className="t-label mt-3 text-smoke" speed={2} head={false}>
        {`[ FIG. ${person.index} — POINT OR TAP TO RESOLVE ]`}
      </SplitReveal>

      <SplitReveal as="h3" className="t-h3 pt-8" head={false}>
        {person.name}
      </SplitReveal>
      <div lang="ja" className="mt-2">
        <SplitReveal className="t-label text-smoke" speed={2} head={false}>
          {person.native}
        </SplitReveal>
      </div>
      <SplitReveal className="t-label mt-5" speed={2} head={false}>
        {person.role}
      </SplitReveal>
      <SplitReveal className="t-body mt-4 text-smoke" speed={1.6} head={false}>
        {person.background}
      </SplitReveal>
      <blockquote className="mt-6 border-t hairline pt-4">
        <SplitReveal className="t-lead" speed={1.6} head={false}>
          {`“${person.line}”`}
        </SplitReveal>
      </blockquote>
    </article>
  );
}
