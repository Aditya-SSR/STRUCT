"use client";
import type { ComponentProps, Ref } from "react";
import SplitReveal from "@/components/ui/SplitReveal";

type Props = Omit<ComponentProps<typeof SplitReveal>, "when"> & {
  /** while false the text keeps its layout box but stays hidden; the moment it flips true the RESOLVE reveal plays */
  open: boolean;
  ref?: Ref<HTMLElement>;
};

/**
 * SplitReveal for text that sits inside pinned / horizontally-moving / scrubbed layouts, where a vertical
 * ScrollTrigger start is meaningless. The parent decides *when* (from scroll progress or an observer);
 * the reveal itself is still the one signature RESOLVE effect.
 */
export default function GateReveal({ open, as: Tag = "div", className, children, ref, ...rest }: Props) {
  if (!open) {
    return (
      <Tag ref={ref} className={className} style={{ visibility: "hidden" }}>
        {children}
      </Tag>
    );
  }
  return (
    <SplitReveal as={Tag} className={className} {...rest} when="mount">
      {children}
    </SplitReveal>
  );
}
