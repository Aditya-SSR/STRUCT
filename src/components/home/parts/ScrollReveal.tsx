"use client";
import { useRef, type ComponentProps } from "react";
import GateReveal from "./GateReveal";
import { useInView } from "./useInView";

type Props = Omit<ComponentProps<typeof GateReveal>, "open" | "ref"> & {
  /** IntersectionObserver rootMargin: the reveal starts once the element is this far into the viewport */
  rootMargin?: string;
};

/**
 * "Reveal when scrolled into view" built on <GateReveal/> + IntersectionObserver instead of SplitReveal's own
 * `when="scroll"`. Same signature RESOLVE reveal, but it creates no ScrollTrigger per text block, so a window resize
 * (SplitText re-splitting) can never re-create `once` triggers inside a ScrollTrigger refresh pass.
 */
export default function ScrollReveal({ rootMargin = "0px 0px -8% 0px", ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, rootMargin });
  return <GateReveal ref={ref} open={seen} {...rest} />;
}
