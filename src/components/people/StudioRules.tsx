"use client";
import { useState } from "react";
import { STUDIO_RULES } from "@/data/brand";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import { Datum } from "@/components/ui/Datum";

/** The five studio rules as huge stacked lines. Load lines draw between them; hover lights one and dims the rest. */
export default function StudioRules() {
  const [hot, setHot] = useState<number | null>(null);

  return (
    <section data-header-tone="dark" aria-label="Studio rules" className="tone-noir relative pad-x pb-24 pt-24 md:pb-40 md:pt-32">
      <Datum className="absolute left-[var(--margin)] top-6" />
      <Datum className="absolute right-[var(--margin)] top-6" />

      <div className="flex items-end justify-between gap-6">
        <SplitReveal className="t-label text-ash" speed={2} head={false}>
          § 04 — THE STUDIO RULES
        </SplitReveal>
        <div lang="ja">
          <SplitReveal className="t-label text-ash" speed={2} head={false}>
            [ KŌZŌ 構造 ]
          </SplitReveal>
        </div>
      </div>

      <ol className="mt-10 md:mt-16" onPointerLeave={() => setHot(null)}>
        {STUDIO_RULES.map((r, i) => (
          <li
            key={r.n}
            onPointerEnter={() => setHot(i)}
            data-cursor="RULE"
            className={`transition-opacity duration-500 ease-out ${hot !== null && hot !== i ? "opacity-25" : "opacity-100"}`}
          >
            <LoadLine className="w-full" />
            <div className="grid grid-cols-[auto_1fr] items-start gap-x-5 py-6 md:grid-cols-[7rem_1fr] md:gap-x-10 md:py-10">
              <span
                aria-hidden
                className={`t-dots pt-1 text-3xl transition-colors duration-300 md:pt-3 md:text-6xl ${hot === i ? "text-signal" : "text-paper"}`}
              >
                {r.n}
              </span>
              <SplitReveal
                as="p"
                className="font-display text-[clamp(1.5rem,4.8vw,5.5rem)] uppercase leading-[.95] tracking-[-0.04em]"
                head={false}
              >
                {r.rule}
              </SplitReveal>
            </div>
          </li>
        ))}
        <li aria-hidden className="list-none">
          <LoadLine className="w-full" />
        </li>
      </ol>
    </section>
  );
}
