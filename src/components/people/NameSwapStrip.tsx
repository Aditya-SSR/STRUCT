"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { PEOPLE } from "@/data/brand";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import DotCanvas from "./DotCanvas";
import PortraitPhoto from "./PortraitPhoto";
import SwapWord from "./SwapWord";

const IDLE = "STRUCTS";
const BIG = "font-display uppercase text-center leading-[.86] tracking-[-0.05em] text-[min(14vw,17rem)]";

/**
 * The original team-section idea: a strip of small portraits; hovering (or focusing / tapping) one scales it up
 * and swaps the giant word STRUCTS for that person's first name, character by character from the centre,
 * dot-glyph flicker -> lock. Returns on leave.
 */
export default function NameSwapStrip() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const lastType = useRef("mouse");

  const person = PEOPLE.find((p) => p.id === active) ?? null;
  const word = person ? person.name.split(" ")[0].toUpperCase() : IDLE;

  // portraits open like drawn frames on scroll
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".strip-frame", {
        clipPath: "inset(100% 0% 0% 0%)",
        duration: 1.3,
        stagger: 0.08,
        ease: "expo.out",
        clearProps: "clipPath",
        scrollTrigger: { trigger: ".strip-row", start: "top 88%", once: true },
      });
    },
    { scope: root },
  );

  // active portrait scales up (origin bottom) and resolves to its photograph; the rest settle back
  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      gsap.utils.toArray<HTMLElement>(".strip-item").forEach((el) => {
        const on = el.dataset.id === active;
        gsap.to(el, { scale: on ? 1.32 : 1, zIndex: on ? 10 : 1, duration: reduce ? 0 : 0.55, ease: "power2.out", overwrite: "auto" });
        gsap.to(el.querySelector(".strip-photo"), {
          clipPath: on ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
          duration: reduce ? 0 : 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    },
    { scope: root, dependencies: [active] },
  );

  return (
    <section ref={root} data-header-tone="light" aria-label="Hover a person" className="relative overflow-x-clip bg-bone pb-24 pt-24 text-ink md:pb-36 md:pt-32">
      <div className="pad-x flex items-end justify-between gap-6">
        <SplitReveal className="t-label text-smoke" speed={2} head={false}>
          § 03 — THE ROOM
        </SplitReveal>
        <SplitReveal className="t-label text-smoke" speed={2} head={false}>
          [ HOVER OR TAP A FACE ]
        </SplitReveal>
      </div>
      <LoadLine className="mx-[var(--margin)] mt-4" />

      <SwapWord
        word={word}
        idleWord={IDLE}
        wordClassName={BIG}
        className="pad-x mt-10 md:mt-14"
        idle={
          <SplitReveal as="h2" className={BIG} head={false}>
            {IDLE}
          </SplitReveal>
        }
      />

      <div className="pad-x mt-4 flex min-h-[2.5rem] items-center justify-between gap-4 md:mt-8">
        <span className="t-dots text-3xl md:text-4xl" aria-hidden>
          {person ? person.index : "00"}
        </span>
        <p className="t-label text-right text-smoke">{person ? `${person.role} — ${person.discipline}` : "Four people. One studio. Tokyo."}</p>
      </div>

      <div className="strip-row pad-x mx-auto mt-16 grid max-w-[960px] grid-cols-4 gap-3 md:mt-24 md:gap-8">
        {PEOPLE.map((p) => (
          <div key={p.id} className="flex flex-col">
            <button
              type="button"
              data-id={p.id}
              data-cursor="NAME"
              aria-pressed={active === p.id}
              aria-label={`Show ${p.name}`}
              onPointerEnter={(e) => {
                lastType.current = e.pointerType;
                if (e.pointerType !== "touch") setActive(p.id);
              }}
              onPointerLeave={(e) => e.pointerType !== "touch" && setActive(null)}
              onPointerDown={(e) => (lastType.current = e.pointerType)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && setActive(p.id)}
              onBlur={() => setActive(null)}
              onClick={() => lastType.current === "touch" && setActive((a) => (a === p.id ? null : p.id))}
              className="strip-item relative block w-full origin-bottom outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
              style={{ aspectRatio: "4 / 5", touchAction: "manipulation" }}
            >
              <span className="strip-frame absolute inset-0 block overflow-hidden bg-paper">
                <DotCanvas image={p.image} />
                <span
                  className="strip-photo absolute inset-0 block overflow-hidden"
                  style={{ clipPath: "inset(100% 0% 0% 0%)" }}
                >
                  <PortraitPhoto image={p.image} alt="" />
                </span>
              </span>
            </button>
            <span className="t-dots mt-3 text-lg text-smoke md:mt-4" aria-hidden>
              {p.index}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
