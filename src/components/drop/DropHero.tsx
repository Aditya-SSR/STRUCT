import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import { Datum } from "@/components/ui/Datum";
import { DROP, dropClaimed, dropRemaining } from "@/data/drop";
import { SignalDot } from "./Bits";
import DropStage from "./DropStage";

/** Release time is fixed copy (never a live clock), so server and client markup always match. */
const stats = () => [
  { k: "RELEASED", v: "14 NOV 2026", sub: "12:00 JST" },
  { k: "GARMENTS", v: String(DROP.garments), sub: "OBJ.01 — OBJ.08" },
  { k: "UNITS", v: String(DROP.totalUnits), sub: `${DROP.garments} × ${DROP.unitsPerGarment}` },
  { k: "REMAINING", v: String(dropRemaining()), sub: "AND FALLING" },
  { k: "RESTOCK", v: "NO", sub: "ONCE. NEVER AGAIN." },
];

export default function DropHero() {
  const claimed = dropClaimed();
  const pct = (claimed / DROP.totalUnits) * 100;
  return (
    <section
      data-header-tone="dark"
      aria-labelledby="drop-title"
      className="tone-noir pad-x relative flex min-h-[100svh] flex-col overflow-hidden pb-8 pt-[calc(var(--header-h)+28px)]"
    >
      <div className="flex items-center justify-between gap-4 border-b hairline pb-4">
        <SplitReveal as="p" when="intro" speed={2} head={false} className="t-label">
          §01 — THE EIGHT
        </SplitReveal>
        <p className="t-label inline-flex items-center gap-2">
          <SignalDot />
          <SplitReveal as="span" when="intro" speed={2} head={false} className="inline-block">
            {`${DROP.status} — ${DROP.statusLine}`}
          </SplitReveal>
        </p>
      </div>

      <div className="mt-10 grid gap-8 md:mt-12 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-7">
          <SplitReveal as="p" when="intro" delay={0.5} speed={1.2} className="t-h2">
            EIGHT GARMENTS. ONE DROP.
          </SplitReveal>
          <SplitReveal as="p" when="intro" delay={0.9} speed={1.6} head={false} className="t-body mt-6 max-w-[44ch] text-ash">
            Each one made correctly. Released once, never restocked.
          </SplitReveal>
        </div>
        <DropStage />
      </div>

      <div className="relative z-10 mt-auto pt-12">
        <h1 id="drop-title" className="-ml-[0.04em]">
          <SplitReveal when="intro" className="t-dots block text-[length:min(19vw,22rem)] md:text-[length:min(13.6vw,18rem)]">
            DROP-01
          </SplitReveal>
        </h1>

        <dl className="mt-8 grid grid-cols-2 border-t hairline md:mt-12 md:grid-cols-5">
          {stats().map((s, i) => (
            <div
              key={s.k}
              className={`hairline relative py-5 pr-4 ${i % 2 ? "border-l pl-4" : ""} ${i === 4 ? "col-span-2 border-l-0 pl-0 md:col-span-1" : ""} ${
                i > 0 ? "md:border-l md:pl-6" : ""
              }`}
            >
              <dt>
                <SplitReveal as="span" when="intro" delay={1 + i * 0.1} speed={2} head={false} className="t-label block text-ash">
                  {s.k}
                </SplitReveal>
              </dt>
              <dd className="mt-3">
                <SplitReveal
                  as="span"
                  when="intro"
                  delay={1.1 + i * 0.1}
                  speed={1.6}
                  head={false}
                  className="t-dots block text-[length:clamp(1.4rem,2.4vw,2.4rem)]"
                >
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

        {/* claimed / 800 — a load line that draws to the share already gone */}
        <div className="border-t hairline pt-5">
          <div className="flex items-end justify-between gap-4">
            <SplitReveal as="p" when="intro" delay={1.4} speed={2} head={false} className="t-label">
              CLAIMED
            </SplitReveal>
            <p className="t-dots text-lg">
              {claimed} / {DROP.totalUnits}
            </p>
          </div>
          <div className="relative mt-3 h-[3px] w-full bg-paper/15" role="img" aria-label={`${claimed} of ${DROP.totalUnits} units claimed`}>
            <div style={{ width: `${pct}%` }}>
              <LoadLine when="intro" delay={1.5} duration={2} thickness={3} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
