"use client";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const GLYPHS = "0123456789+-/=#*<>:;";
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/**
 * Hover swap in the RESOLVE language: on hover/focus of the nearest link/button the label's characters
 * flicker into dot-matrix glyphs (Bitcount) and lock back to the real letters, left to right.
 * Characters keep their measured width while flickering, so nothing around them moves.
 */
export default function HoverResolve({ text, className = "" }: { text: string; className?: string }) {
  const host = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_c, contextSafe) => {
      const el = host.current;
      if (!el || !contextSafe) return;
      const trigger = (el.closest("a,button") as HTMLElement | null) ?? el;
      const chars = Array.from(el.querySelectorAll<HTMLElement>("[data-c]"));
      const n = chars.length;
      let tween: gsap.core.Tween | null = null;

      const settle = () => {
        chars.forEach((c, i) => {
          c.textContent = text[i];
          c.style.fontFamily = "";
          c.style.fontSize = "";
          c.style.width = "";
        });
      };

      const play = contextSafe(() => {
        if (prefersReducedMotion() || n < 2) return;
        tween?.kill();
        settle();
        const widths = chars.map((c) => c.getBoundingClientRect().width);
        chars.forEach((c, i) => (c.style.width = `${widths[i]}px`));
        const state = { p: 0 };
        let frame = 0;
        tween = gsap.to(state, {
          p: 1,
          duration: 0.2 + n * 0.03,
          ease: "none",
          onUpdate() {
            frame++;
            chars.forEach((c, i) => {
              if (text[i] === " ") return;
              const lockAt = 0.12 + (i / (n - 1)) * 0.78;
              if (state.p >= lockAt) {
                if (c.dataset.l !== "1") {
                  c.dataset.l = "1";
                  c.textContent = text[i];
                  c.style.fontFamily = "";
                  c.style.fontSize = "";
                }
              } else if (frame % 3 === 0 || c.dataset.l !== "0") {
                c.dataset.l = "0";
                c.textContent = rnd();
                c.style.fontFamily = "var(--font-bitcount), monospace";
                c.style.fontSize = ".78em";
              }
            });
          },
          onComplete: settle,
        });
      });
      const stop = contextSafe(() => {
        tween?.kill();
        settle();
      });

      trigger.addEventListener("pointerenter", play);
      trigger.addEventListener("focus", play);
      trigger.addEventListener("pointerleave", stop);
      return () => {
        trigger.removeEventListener("pointerenter", play);
        trigger.removeEventListener("focus", play);
        trigger.removeEventListener("pointerleave", stop);
        tween?.kill();
      };
    },
    { scope: host, dependencies: [text] },
  );

  return (
    <span ref={host} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-block whitespace-pre">
        {Array.from(text).map((ch, i) => (
          <span key={i} data-c className="inline-block text-center">
            {ch}
          </span>
        ))}
      </span>
    </span>
  );
}
