"use client";
import type { ReactNode, Ref } from "react";
import SplitReveal from "@/components/ui/SplitReveal";
import ScrollReveal from "./ScrollReveal";
import { Datum } from "@/components/ui/Datum";

type Props = {
  children: ReactNode;
  /** marker number, rendered as §NN */
  num: string;
  /** short label shown top-right of the plate, e.g. "INDEX" */
  label: string;
  tone?: "blanc" | "noir";
  id?: string;
  className?: string;
  ref?: Ref<HTMLElement>;
  /** hero only: chrome text waits for the preloader */
  intro?: boolean;
  /** draw the hairline frame + datum crosses (default true) */
  frame?: boolean;
  /** chrome uses mix-blend-difference so it reads on both paper and ink (DropReveal) */
  blend?: boolean;
  "aria-label"?: string;
};

/**
 * A full-viewport "plate": hairline frame, four datum crosses, § marker and a label.
 * Tone alternates blanc / noir down the page (the two colourways of the suit).
 */
export default function Plate({
  children,
  num,
  label,
  tone = "blanc",
  id,
  className = "",
  ref,
  intro,
  frame = true,
  blend,
  ...aria
}: Props) {
  const chip = (text: string) =>
    intro ? (
      <SplitReveal when="intro" head={false} speed={2} className="t-label">
        {text}
      </SplitReveal>
    ) : (
      <ScrollReveal head={false} speed={2} className="t-label">
        {text}
      </ScrollReveal>
    );
  return (
    <section
      ref={ref}
      id={id}
      data-header-tone={tone === "noir" ? "dark" : "light"}
      aria-label={aria["aria-label"]}
      className={`relative isolate ${tone === "noir" ? "tone-noir" : "tone-blanc"} ${className}`}
    >
      {children}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-20 ${blend ? "mix-blend-difference text-paper" : ""}`}
      >
        {frame && (
          <div className="hairline absolute inset-2 border md:inset-3">
            <Datum className="absolute -left-[6.5px] -top-[6.5px]" />
            <Datum className="absolute -right-[6.5px] -top-[6.5px]" />
            <Datum className="absolute -bottom-[6.5px] -left-[6.5px]" />
            <Datum className="absolute -bottom-[6.5px] -right-[6.5px]" />
          </div>
        )}
        <div className="absolute inset-x-[calc(var(--margin)+6px)] top-[calc(var(--header-h)+6px)] flex items-start justify-between opacity-70">
          {chip(`§${num}`)}
          {chip(label)}
        </div>
      </div>
    </section>
  );
}
