import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import { Datum } from "@/components/ui/Datum";
import { SUIT_RELEASE, PRODUCTS } from "@/data/products";
import HeroStage from "./HeroStage";
import { SignalDot } from "./StockChip";
import { totalRemaining, totalClaimed } from "./shop-utils";

/** Release time is fixed copy (never a live clock), so server and client markup always match. */
const STATS = () => [
  { k: "RELEASED", v: "21 NOV 2026", sub: "12:00 JST" },
  { k: "UNITS", v: String(SUIT_RELEASE.totalUnits), sub: `${PRODUCTS.length} SKUS × 100` },
  { k: "REMAINING", v: String(totalRemaining()), sub: "AND FALLING" },
  { k: "RESTOCK", v: "NO", sub: "NEVER AGAIN." },
];

export default function SuitHero() {
  const claimed = totalClaimed();
  const pct = (claimed / SUIT_RELEASE.totalUnits) * 100;
  return (
    <section
      data-header-tone="dark"
      aria-labelledby="suit-title"
      className="tone-noir pad-x relative flex min-h-[100svh] flex-col overflow-hidden pb-8 pt-[calc(var(--header-h)+28px)]"
    >
      <HeroStage />

      <div className="relative z-10 flex items-center justify-between gap-4 border-b hairline pb-4">
        <SplitReveal as="p" when="intro" speed={2} head={false} className="t-label">
          §01 — THE SHOP
        </SplitReveal>
        <p className="t-label inline-flex items-center gap-2">
          <SignalDot />
          <SplitReveal as="span" when="intro" speed={2} head={false} className="inline-block">
            {`${SUIT_RELEASE.status} — SYS.STATUS: ACTIVE`}
          </SplitReveal>
        </p>
      </div>

      <div className="relative z-10 mt-auto pt-16">
        <h1 id="suit-title" className="-ml-[0.04em]">
          <SplitReveal when="intro" className="t-dots block text-[length:min(19vw,22rem)] md:text-[length:min(13.6vw,18rem)]">
            SUIT-01
          </SplitReveal>
        </h1>

        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-12 md:gap-x-6">
          <SplitReveal as="p" when="intro" delay={0.5} speed={1.2} className="t-h2 md:col-span-7">
            ONE STRUCTURE. SOLD WHOLE.
          </SplitReveal>
          <SplitReveal
            as="p"
            when="intro"
            delay={0.9}
            speed={1.6}
            head={false}
            className="t-body max-w-[44ch] text-ash md:col-span-4 md:col-start-9 md:self-end"
          >
            Coat, tunic, trouser and belt, cut as one structure. Four SKUs, a hundred units each, never restocked. When they are gone the structure is closed.
          </SplitReveal>
        </div>

        <dl className="mt-12 grid grid-cols-2 border-t hairline md:grid-cols-4">
          {STATS().map((s, i) => (
            <div key={s.k} className={`hairline relative py-5 pr-4 ${i % 2 ? "border-l pl-4" : ""} ${i > 0 ? "md:border-l md:pl-6" : ""}`}>
              <dt>
                <SplitReveal as="span" when="intro" delay={1 + i * 0.1} speed={2} head={false} className="t-label block text-ash">
                  {s.k}
                </SplitReveal>
              </dt>
              <dd className="mt-3">
                <SplitReveal as="span" when="intro" delay={1.1 + i * 0.1} speed={1.6} head={false} className="t-dots block text-[length:clamp(1.5rem,2.8vw,3.25rem)]">
                  {s.v}
                </SplitReveal>
                <SplitReveal as="span" when="intro" delay={1.2 + i * 0.1} speed={2} head={false} className="t-label mt-2 block text-smoke">
                  {s.sub}
                </SplitReveal>
              </dd>
              {i === 0 && <Datum className="absolute -left-[5px] -top-[6px]" />}
            </div>
          ))}
        </dl>

        {/* claimed / 400 — a load line that draws to the share already gone */}
        <div className="mt-2 border-t hairline pt-5">
          <div className="flex items-end justify-between gap-4">
            <SplitReveal as="p" when="intro" delay={1.4} speed={2} head={false} className="t-label">
              CLAIMED
            </SplitReveal>
            <p className="t-dots text-lg">
              {claimed} / {SUIT_RELEASE.totalUnits}
            </p>
          </div>
          <div className="relative mt-3 h-[3px] w-full bg-paper/15" role="img" aria-label={`${claimed} of ${SUIT_RELEASE.totalUnits} units claimed`}>
            <div style={{ width: `${pct}%` }}>
              <LoadLine when="intro" delay={1.5} duration={2} thickness={3} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
