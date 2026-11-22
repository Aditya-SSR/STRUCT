"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Datum } from "@/components/ui/Datum";
import { useUI } from "@/store/ui";
import type { Garment } from "@/data/drop";
import { GALLERY_SIZES, imgSrc } from "./drop-utils";

const FULL = "inset(0% 0% 0% 0%)";
const SHUT = "inset(100% 0% 0% 0%)";

/**
 * One DOM, two layouts. >=768px: a vertical stack (front, side, detail crop) with clip reveal + slow drift.
 * <768px: a swipeable scroll-snap carousel with a 01 / 03 counter.
 */
export default function GarmentGallery({ garment: g }: { garment: Garment }) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const introDone = useUI((s) => s.introDone);
  const [active, setActive] = useState(0);

  const frames = [
    { key: g.images[0], label: "front", zoom: 1 },
    { key: g.images[1], label: "side", zoom: 1 },
    { key: g.images[0], label: "detail", zoom: 1.4 },
  ];

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
          if (!reveal || !inner) return;
          const st = { trigger: fig, start: "top 88%", once: true };
          gsap.fromTo(reveal, { clipPath: SHUT }, { clipPath: FULL, duration: 1.3, ease: "expo.out", scrollTrigger: st });
          gsap.fromTo(inner, { scale: 1.16 }, { scale: 1, duration: 1.7, ease: "expo.out", scrollTrigger: st });
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [introDone] },
  );

  const onScroll = () => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth + 2) return;
    setActive(Math.round((el.scrollLeft / (el.scrollWidth - el.clientWidth)) * (frames.length - 1)));
  };

  return (
    <div ref={root} className="relative">
      <div className="mb-3 flex items-center justify-between md:hidden">
        <span className="t-dots text-base" aria-live="polite">
          {String(active + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
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
        aria-label={`${g.name} photographs`}
        className="relative -mx-[var(--margin)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--margin)] [scrollbar-width:none] md:mx-0 md:snap-none md:flex-col md:gap-6 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {frames.map((f, i) => (
          <figure
            key={f.label}
            data-fig
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${frames.length}`}
            className="relative w-[84vw] shrink-0 snap-center md:w-full"
          >
            <div className="relative aspect-[4/5] border hairline bg-bone md:aspect-[6/7]">
              <div data-reveal className="absolute inset-0 overflow-hidden md:[clip-path:inset(100%_0%_0%_0%)]">
                <div data-inner className="absolute inset-0">
                  <div
                    className="absolute inset-0"
                    style={f.zoom !== 1 ? { transform: `scale(${f.zoom})`, transformOrigin: "50% 30%" } : undefined}
                  >
                    <Image
                      src={imgSrc(f.key)}
                      alt={`${g.name}, ${f.label} view`}
                      fill
                      sizes={GALLERY_SIZES}
                      quality={85}
                      priority={i === 0}
                      className="object-cover"
                      style={{ objectPosition: "50% 50%" }}
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
              <span>
                [ FIG. {String(i + 1).padStart(2, "0")} — {f.label.toUpperCase()} ]
              </span>
              <span className="hidden md:inline">{g.sku}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
