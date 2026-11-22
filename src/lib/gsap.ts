"use client";
/**
 * Single GSAP registry. ALWAYS import gsap & plugins from here, never from "gsap" directly,
 * so plugins are registered exactly once.
 */
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { CustomEase } from "gsap/CustomEase";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip, Observer, CustomEase);
  // STRUCT house ease: slow-in, hard-out "resolve" curve used for covers / menu / transitions
  CustomEase.create("resolve", "0.76, 0, 0.24, 1");
  gsap.defaults({ ease: "expo.out", duration: 1.1 });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, useGSAP, ScrollTrigger, SplitText, Flip, Observer, CustomEase };
