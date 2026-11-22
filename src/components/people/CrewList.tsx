"use client";
import { CREW } from "@/data/brand";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";

const COLS = "grid-cols-[1.4fr_1fr] md:grid-cols-[4rem_1.6fr_1.2fr_1fr]";

/** Extended crew as a table-like list. Hairlines draw; row hover inverts (paper on ink). */
export default function CrewList() {
  return (
    <section data-header-tone="light" aria-label="Extended crew" className="tone-blanc relative pad-x pb-24 pt-24 md:pb-36 md:pt-32">
      <div className="grid-12 items-end gap-y-6">
        <SplitReveal className="t-label col-span-12 text-smoke md:col-span-3" speed={2} head={false}>
          § 05 — THE CREW
        </SplitReveal>
        <SplitReveal as="h2" className="t-h2 col-span-12 md:col-span-9">
          Seven more. One in every node.
        </SplitReveal>
      </div>

      <div className="mt-12 md:mt-20" role="table" aria-label="Extended crew">
        <div role="row" className={`grid ${COLS} gap-x-4 pb-3 text-smoke md:gap-x-6`}>
          <span role="columnheader" className="t-label hidden md:block">No.</span>
          <span role="columnheader" className="t-label">Name</span>
          <span role="columnheader" className="t-label hidden md:block">Role</span>
          <span role="columnheader" className="t-label text-right md:text-left">Node</span>
        </div>
        {CREW.map((c, i) => (
          <div key={c.name} data-cursor="CREW" className="group">
            <LoadLine className="w-full text-ash" delay={i * 0.04} />
            <div
              role="row"
              className={`-mx-4 grid ${COLS} items-center gap-x-4 px-4 py-5 transition-colors duration-300 ease-out group-hover:bg-ink group-hover:text-paper md:gap-x-6 md:py-7`}
            >
              <span role="cell" aria-hidden className="t-dots hidden text-xl md:block">{String(i + 5).padStart(2, "0")}</span>
              <div role="cell" className="font-display text-[clamp(1rem,2.2vw,2.25rem)] uppercase leading-none tracking-[-0.03em]">
                <SplitReveal head={false} speed={1.6}>{c.name}</SplitReveal>
              </div>
              <div role="cell" className="t-label col-start-1 mt-2 md:col-start-auto md:mt-0">
                <SplitReveal head={false} speed={2}>{c.role}</SplitReveal>
              </div>
              <div role="cell" className="t-label col-start-2 row-start-1 text-right md:col-start-auto md:row-start-auto md:text-left">
                <SplitReveal head={false} speed={2}>{c.node}</SplitReveal>
              </div>
            </div>
          </div>
        ))}
        <LoadLine className="w-full text-ash" />
      </div>
    </section>
  );
}
