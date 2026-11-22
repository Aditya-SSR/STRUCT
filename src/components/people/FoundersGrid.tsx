"use client";
import { PEOPLE } from "@/data/brand";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import { Datum } from "@/components/ui/Datum";
import PersonCard from "./PersonCard";

// editorial stagger: offset rows on desktop (4 cols) and tablet (2 cols), flat on mobile
const OFFSETS = ["", "md:mt-24 lg:mt-28", "lg:mt-8", "md:mt-24 lg:mt-40"];

export default function FoundersGrid() {
  return (
    <section data-header-tone="light" className="tone-blanc relative pad-x pb-28 pt-24 md:pb-40 md:pt-32" aria-label="The four co-founders">
      <Datum className="absolute left-[var(--margin)] top-6 text-smoke" />
      <Datum className="absolute right-[var(--margin)] top-6 text-smoke" />

      <div className="grid-12 items-end gap-y-6">
        <SplitReveal className="t-label col-span-12 text-smoke md:col-span-3" speed={2} head={false}>
          § 02 — THE FOUR
        </SplitReveal>
        <SplitReveal as="h2" className="t-h2 col-span-12 md:col-span-9">
          Four disciplines. One rule.
        </SplitReveal>
      </div>
      <LoadLine className="mt-10 mb-14 w-full md:mb-20" />

      <div className="grid grid-cols-1 gap-x-6 gap-y-20 md:grid-cols-2 lg:grid-cols-4">
        {PEOPLE.map((p, i) => (
          <PersonCard key={p.id} person={p} className={OFFSETS[i]} />
        ))}
      </div>
    </section>
  );
}
