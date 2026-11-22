import Image from "next/image";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import { Datum, Fig } from "@/components/ui/Datum";
import { SUIT } from "@/data/products";

/** SOLD WHOLE — the four pieces and the single load line that runs through all of them. */
export default function SoldWholeBand() {
  return (
    <section
      data-header-tone="dark"
      aria-label="Sold whole"
      className="tone-noir pad-x relative py-20 md:py-32"
    >
      <div className="grid gap-12 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-7">
          <Fig className="text-ash">FIG. 01 — ONE STRUCTURE</Fig>
          <SplitReveal as="h2" className="t-h1 mt-6">
            SOLD WHOLE.
          </SplitReveal>
          <SplitReveal as="p" speed={1.6} head={false} className="t-lead mt-8 max-w-[34ch] md:mt-12">
            {SUIT.whySoldWhole}
          </SplitReveal>
          <SplitReveal as="p" speed={2} head={false} className="t-label mt-8 text-ash">
            BOOTS IN THE PHOTOGRAPHS ARE STYLING. NOT INCLUDED.
          </SplitReveal>
        </div>
        <figure className="relative md:col-span-4 md:col-start-9">
          <div className="relative aspect-[4/5] border hairline">
            <Image
              src="/img/pair.webp"
              alt="Two people in SUIT-01, back to back: one in blanc, one in noir. The white load lines on the black suit run unbroken from shoulder to ankle."
              fill
              sizes="(min-width: 768px) 30vw, 92vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
          <Datum className="absolute -left-[6px] -top-[6px]" />
          <Datum className="absolute -right-[6px] -top-[6px]" />
          <Datum className="absolute -bottom-[6px] -left-[6px]" />
          <Datum className="absolute -bottom-[6px] -right-[6px]" />
        </figure>
      </div>

      {/* the four pieces, joined by one drawn line */}
      <div className="relative mt-20 md:mt-28">
        <LoadLine className="w-full" thickness={2} duration={2.4} />
        <ol className="grid grid-cols-2 gap-x-6 md:grid-cols-4">
          {SUIT.pieces.map((piece, i) => (
            <li key={piece.n} className="relative pb-8 pt-6">
              <Datum className="absolute -top-[6px] left-0" signal={i === 0} />
              <SplitReveal as="span" speed={2} head={false} delay={0.3 + i * 0.35} className="t-dots block text-3xl md:text-5xl">
                {piece.n}
              </SplitReveal>
              <SplitReveal as="h3" speed={1.4} head={false} delay={0.4 + i * 0.35} className="t-h3 mt-4">
                {piece.name}
              </SplitReveal>
              <SplitReveal as="p" speed={1.8} head={false} delay={0.5 + i * 0.35} className="t-body mt-3 max-w-[28ch] text-ash">
                {piece.body}
              </SplitReveal>
            </li>
          ))}
        </ol>
        <LoadLine className="w-full text-smoke" thickness={1} duration={2.4} delay={0.3} reverse />
      </div>
    </section>
  );
}
