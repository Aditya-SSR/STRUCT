"use client";
import { PEOPLE } from "@/data/brand";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import { Datum } from "@/components/ui/Datum";

/** Hero for /people (tone-blanc). Headline, lead, location meta, a roster of the four disciplines, load line. */
export default function PeopleHero() {
  return (
    <section data-header-tone="light" aria-label="The people" className="tone-blanc relative flex min-h-svh flex-col justify-between pad-x pb-10 pt-[calc(var(--header-h)+3rem)] md:pb-14 md:pt-[calc(var(--header-h)+5rem)]">
      <Datum className="absolute left-[var(--margin)] top-[calc(var(--header-h)+8px)] text-smoke" />
      <Datum className="absolute right-[var(--margin)] top-[calc(var(--header-h)+8px)] text-smoke" />

      <div>
        <SplitReveal className="t-label text-smoke" when="intro" speed={2} head={false}>
          [ KIBA, TOKYO — SINCE 2019 ]
        </SplitReveal>
        <SplitReveal as="h1" className="t-h1 pt-6 md:pt-10" when="intro" delay={0.15}>
          The people who resolve.
        </SplitReveal>
      </div>

      <div className="mt-16 grid-12 items-end gap-y-10">
        <SplitReveal className="t-lead col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-8" when="intro" delay={0.6} speed={1.6} head={false}>
          Four people from four disciplines resigned from four design jobs in the same week of 2019. An architect, a pattern cutter, a textile engineer, a type designer. They met on a Sunday on the top floor of a closed rope factory. They stayed.
        </SplitReveal>
      </div>

      <div className="mt-16 md:mt-24">
        {/* four construction lines, one per person, landing on the roster below */}
        <div aria-hidden className="hidden h-20 grid-cols-4 gap-x-6 md:grid">
          {PEOPLE.map((p, i) => (
            <div key={p.id} className="relative">
              <Datum className="absolute -left-[5px] -top-[5px] text-smoke" />
              <LoadLine orientation="v" className="h-full text-smoke" when="intro" delay={0.2 + i * 0.12} duration={1.2} />
            </div>
          ))}
        </div>
        <LoadLine className="w-full" when="intro" delay={0.4} />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 pt-5 md:grid-cols-4 md:gap-x-6">
          {PEOPLE.map((p, i) => (
            <li key={p.id} className="flex items-baseline gap-3">
              <span className="t-dots text-2xl md:text-3xl" aria-hidden>{p.index}</span>
              <SplitReveal className="t-label" when="intro" delay={0.9 + i * 0.08} speed={2} head={false}>
                {p.discipline}
              </SplitReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
