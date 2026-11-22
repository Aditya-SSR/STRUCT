import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import { PRODUCTS } from "@/data/products";
import ProductCard from "./ProductCard";

/** THE OTHER THREE — the remaining SKUs as compact cards (swipeable row on mobile). */
export default function OtherThree({ currentSlug }: { currentSlug: string }) {
  const others = PRODUCTS.filter((p) => p.slug !== currentSlug);
  return (
    <section data-header-tone="light" aria-label="The other three SKUs"className="tone-blanc pad-x pb-28 pt-16 md:pb-24 md:pt-28">
      <LoadLine className="w-full" thickness={1} duration={1.8} />
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 md:mt-12">
        <SplitReveal as="h2" className="t-h2">
          THE OTHER THREE
        </SplitReveal>
        <p className="t-dots text-lg" aria-hidden>
          {others.length} / {PRODUCTS.length}
        </p>
      </div>
      <ul className="relative -mx-[var(--margin)] mt-10 flex snap-x gap-4 overflow-x-auto px-[var(--margin)] pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {others.map((p, i) => (
          <ProductCard key={p.sku} product={p} index={i} compact />
        ))}
      </ul>
    </section>
  );
}
