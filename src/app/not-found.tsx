import type { Metadata } from "next";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import Button from "@/components/ui/Button";
import { Datum } from "@/components/ui/Datum";

export const metadata: Metadata = { title: "OBJ.404 — Not resolved" };

/** On-brand 404: a structure that does not carry. */
export default function NotFound() {
  return (
    <section className="tone-blanc relative flex min-h-[100svh] flex-col justify-between overflow-hidden pad-x pb-10 pt-[calc(var(--header-h)+2rem)]">
      <div className="flex items-center justify-between gap-6">
        <SplitReveal as="p" when="intro" speed={2} head={false} className="t-label">
          OBJ.404 — NOT RESOLVED
        </SplitReveal>
        <span className="t-label hidden items-center gap-2 text-smoke md:inline-flex">
          <Datum size={9} signal /> SYS.STATUS: NO LOAD PATH
        </span>
      </div>

      <div className="relative my-10">
        <LoadLine when="intro" className="mb-6 w-full text-ink/30" />
        <SplitReveal
          as="h1"
          when="intro"
          speed={0.8}
          className="t-dots whitespace-nowrap text-[clamp(8rem,min(42vw,46svh),38rem)] leading-[0.78] tracking-[-0.02em]"
        >
          404
        </SplitReveal>
        <LoadLine when="intro" delay={0.3} className="mt-6 w-full text-ink/30" />
      </div>

      <div className="grid-12 items-end gap-y-8">
        <div className="col-span-12 md:col-span-6">
          <SplitReveal as="p" when="intro" delay={0.4} speed={1.6} head={false} className="t-lead max-w-[34ch]">
            This page does not carry anything. We cut it, or it was never drawn.
          </SplitReveal>
        </div>
        <div className="col-span-12 flex flex-wrap items-center gap-4 md:col-span-6 md:justify-end">
          <Button href="/" variant="solid" data-cursor="HOME">
            BACK TO INDEX
          </Button>
          <Button href="/drop-01" variant="line" data-cursor="SHOP">
            DROP-01
          </Button>
        </div>
      </div>
    </section>
  );
}
