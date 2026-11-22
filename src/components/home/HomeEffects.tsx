"use client";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/** Fonts change text metrics after first paint; every measured/pinned layout on the home page re-measures once they land. */
export default function HomeEffects() {
  useEffect(() => {
    let alive = true;
    const refresh = () => alive && ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });
    return () => {
      alive = false;
      window.removeEventListener("load", refresh);
    };
  }, []);
  return null;
}
