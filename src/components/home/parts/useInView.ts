"use client";
import { useEffect, useState, type RefObject } from "react";

type Opts = { rootMargin?: string; once?: boolean; threshold?: number; root?: RefObject<Element | null> };

/** IntersectionObserver as a boolean. `root` lets a horizontal scroller be the viewport. */
export function useInView(ref: RefObject<Element | null>, { rootMargin = "0px", once = false, threshold = 0, root }: Opts = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { root: root?.current ?? null, rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, root, rootMargin, once, threshold]);
  return inView;
}
