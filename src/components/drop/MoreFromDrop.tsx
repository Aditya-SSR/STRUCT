import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import { GARMENTS } from "@/data/drop";
import GarmentCard from "./GarmentCard";

/** MORE FROM DROP-01 — the next four garments in order (wrapping), swipeable on mobile. */
export default function MoreFromDrop({ currentSlug }: { currentSlug: string }) {
  const i = GARMENTS.findIndex((g) => g.slug === currentSlug);
  const others = Array.from({ length: 4 }, (_, k) => GARMENTS[(i + 1 + k) % GARMENTS.length]);
  return (
    <section data-header-tone="light" aria-label="More from DROP-01" className="tone-blanc pad-x pb-24 pt-16 md:pb-28 md:pt-24">
      <LoadLine className="w-full" thickness={1} duration={1.8} />
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 md:mt-12">
        <SplitReveal as="h2" className="t-h2">
          MORE FROM DROP-01
        </SplitReveal>
        <p className="t-dots text-lg" aria-hidden>
          {others.length} / {GARMENTS.length - 1}
        </p>
      </div>
      <ul className="relative -mx-[var(--margin)] mt-10 flex snap-x gap-3 overflow-x-auto px-[var(--margin)] pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {others.map((g, k) => (
          <GarmentCard key={g.sku} garment={g} index={k} compact />
        ))}
      </ul>
    </section>
  );
}
