"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Datum } from "@/components/ui/Datum";
import { useUI } from "@/store/ui";
import type { Product } from "@/data/products";
import { imgSrc, frameRatio, imgDims } from "./shop-utils";

const FULL = "inset(0% 0% 0% 0%)";
const SHUT = "inset(100% 0% 0% 0%)";

/**
 * One DOM, two layouts. ≥768px: a vertical stack with clip reveal + slow parallax.
 * <768px: a horizontally swipeable scroll-snap carousel with a 01 / 04 counter.
 */
export default function Gallery({ product: p }: { product: Product }) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const introDone = useUI((s) => s.introDone);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (!introDone) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const figs = gsap.utils.toArray<HTMLElement>("[data-fig]", root.current);
        if (prefersReducedMotion()) {
          gsap.set(figs.map((f) => f.querySelector("[data-reveal]")), { clipPath: "none" });
          return;
        }
        figs.forEach((fig) => {
          const reveal = fig.querySelector("[data-reveal]");
          const inner = fig.querySelector("[data-inner]");
          const img = fig.querySelector("[data-img]");
          if (!reveal || !inner || !img) return;
          const st = { trigger: fig, start: "top 88%", once: true };
          gsap.fromTo(reveal, { clipPath: SHUT }, { clipPath: FULL, duration: 1.3, ease: "expo.out", scrollTrigger: st });
          gsap.fromTo(inner, { scale: 1.18 }, { scale: 1, duration: 1.7, ease: "expo.out", scrollTrigger: st });
          // slow drift of the photograph inside its frame
          gsap.fromTo(
            img,
            { yPercent: -4 },
            { yPercent: 4, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [introDone] },
  );

  const onScroll = () => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth + 2) return;
    const i = Math.round((el.scrollLeft / (el.scrollWidth - el.clientWidth)) * (p.images.length - 1));
    setActive(i);
  };

  return (
    <div ref={root} className="relative">
      <div className="mb-3 flex items-center justify-between md:hidden">
        <span className="t-dots text-base" aria-live="polite">
          {String(active + 1).padStart(2, "0")} / {String(p.images.length).padStart(2, "0")}
        </span>
        <span className="t-label text-smoke">SWIPE →</span>
      </div>
      <div
        ref={scroller}
        onScroll={onScroll}
        data-lenis-prevent-touch
        data-cursor="DRAG"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${p.title} photographs`}
        className="relative -mx-[var(--margin)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--margin)] [scrollbar-width:none] md:mx-0 md:snap-none md:flex-col md:gap-6 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {p.images.map((key, i) => {
          const [w, h] = imgDims(key);
          return (
            <figure
              key={key + i}
              data-fig
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${p.images.length}`}
              className="relative w-[84vw] shrink-0 snap-center md:w-full"
            >
              <div className="relative border hairline" style={{ aspectRatio: frameRatio(key) }}>
                <div
                  data-reveal
                  className="absolute inset-0 overflow-hidden md:[clip-path:inset(100%_0%_0%_0%)]"
                >
                  <div data-inner className="absolute inset-0">
                    <div data-img className="absolute -inset-y-[5%] inset-x-0">
                      <Image
                        src={imgSrc(key)}
                        alt={`${p.title}, photograph ${i + 1} of ${p.images.length}`}
                        width={w}
                        height={h}
                        sizes="(min-width: 768px) 58vw, 84vw"
                        priority={i === 0}
                        className="h-full w-full object-cover"
                        style={{ objectPosition: i === 0 ? p.focus : "50% 40%" }}
                      />
                    </div>
                  </div>
                </div>
                <Datum className="absolute -left-[6px] -top-[6px]" />
                <Datum className="absolute -right-[6px] -top-[6px]" />
                <Datum className="absolute -bottom-[6px] -left-[6px]" />
                <Datum className="absolute -bottom-[6px] -right-[6px]" />
              </div>
              <figcaption className="t-label mt-3 flex justify-between text-smoke">
                <span>[ FIG. {String(i + 1).padStart(2, "0")} ]</span>
                <span className="hidden md:inline">{p.sku}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
