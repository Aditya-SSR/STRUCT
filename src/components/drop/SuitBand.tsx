import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import Button from "@/components/ui/Button";
import { Fig } from "@/components/ui/Datum";
import { SUIT_RELEASE } from "@/data/products";

/** Closing band: the way out of DROP-01 into the separate whole-body product. */
export default function SuitBand() {
  return (
    <section data-header-tone="dark" aria-label="SUIT-01" className="tone-noir pad-x relative py-20 md:py-32">
      <LoadLine className="w-full" thickness={1} duration={1.8} />
      <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-8">
          <Fig className="text-ash">FIG. 09 — THE NEXT STRUCTURE</Fig>
          <SplitReveal as="h2" className="t-h1 mt-6">
            WANT THE WHOLE BODY?
          </SplitReveal>
        </div>
        <div className="flex flex-col items-start gap-8 md:col-span-4 md:justify-end">
          <SplitReveal as="p" speed={1.6} head={false} className="t-body max-w-[40ch] text-ash">
            {`We were bored of normal clothes, ours included. SUIT-01 is a separate structure: coat, tunic, trouser and belt, sold whole. ${SUIT_RELEASE.totalUnits} units.`}
          </SplitReveal>
          <Button href="/suit-01" tone="paper" data-cursor="VIEW">
            SUIT-01
          </Button>
        </div>
      </div>
    </section>
  );
}
