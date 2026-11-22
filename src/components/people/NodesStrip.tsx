"use client";
import { NODES } from "@/data/brand";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import Button from "@/components/ui/Button";
import { Datum } from "@/components/ui/Datum";

/** Compact strip of the eight nodes + the closing CTA (text only; SUIT-01 imagery lives on / and /drop-01). */
export default function NodesStrip() {
  return (
    <section data-header-tone="light" aria-label="Nodes" className="relative bg-bone pad-x pb-24 pt-24 text-ink md:pb-36 md:pt-32">
      <Datum className="absolute right-[var(--margin)] top-6 text-smoke" />
      <div className="grid-12 items-end gap-y-6">
        <SplitReveal className="t-label col-span-12 text-smoke md:col-span-3" speed={2} head={false}>
          § 06 — THE NODES
        </SplitReveal>
        <SplitReveal as="h2" className="t-h2 col-span-12 md:col-span-9">
          One table. Eight rooms.
        </SplitReveal>
      </div>

      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-20 md:grid-cols-4 md:gap-x-6 md:gap-y-14">
        {NODES.map((n, i) => (
          <li key={n.id} className="relative">
            <LoadLine className="w-full" delay={(i % 4) * 0.06} />
            <div className="flex items-center justify-between pt-3">
              <span className="t-dots text-xl text-smoke" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              {n.origin && <span aria-label="Origin" className="block h-2 w-2 bg-signal" />}
            </div>
            <SplitReveal as="h3" className="t-h3 pt-5" head={false}>
              {n.city}
            </SplitReveal>
            <SplitReveal className="t-label mt-2 text-smoke" speed={2} head={false}>
              {n.role}
            </SplitReveal>
          </li>
        ))}
      </ul>

      <div className="mt-20 flex flex-col items-start justify-between gap-8 border-t hairline pt-10 md:mt-28 md:flex-row md:items-end">
        <SplitReveal as="p" className="t-lead max-w-[34ch]" speed={1.6} head={false}>
          Four people made a rule. Eight rooms keep it. This is what it made.
        </SplitReveal>
        <Button href="/drop-01" data-cursor="DROP-01">
          SEE WHAT WE MADE
        </Button>
      </div>
    </section>
  );
}
