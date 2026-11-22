import SplitReveal from "@/components/ui/SplitReveal";
import Button from "@/components/ui/Button";

/** Cross-link from SUIT-01 to the single-garment shop. */
export default function DropLinkBand() {
  return (
    <section
      data-header-tone="light"
      aria-label="Looking for single pieces"
      className="tone-blanc pad-x border-t hairline py-14 md:py-20"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <SplitReveal as="p" speed={2} head={false} className="t-label text-smoke">
            NOT A WHOLE STRUCTURE?
          </SplitReveal>
          <SplitReveal as="h2" className="t-h2 mt-4">
            LOOKING FOR SINGLE PIECES?
          </SplitReveal>
          <SplitReveal as="p" speed={1.6} head={false} className="t-body mt-5 max-w-[42ch] text-smoke">
            Eight garments, one hundred units each, sold one at a time. That is DROP-01.
          </SplitReveal>
        </div>
        <Button href="/drop-01" data-cursor="VIEW" className="w-full md:w-auto md:min-w-[18rem]">
          SEE DROP-01
        </Button>
      </div>
    </section>
  );
}
