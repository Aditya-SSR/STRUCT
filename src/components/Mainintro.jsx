"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export default function Intro() {
  const sectionRef = useRef(null);
  const deckRef = useRef(null);
  const bgRef = useRef(null);

  useGSAP(() => {
    const deck = deckRef.current;
    const bg = bgRef.current;
    if (!deck || !bg) return;

    let mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
      },
      (context) => {
        let { isDesktop } = context.conditions;

        const panels = gsap.utils.toArray(".panel", deck);
        
        // Explicitly set zIndex to ensure proper stacking initially
        gsap.set(panels, { yPercent: 100, zIndex: (i) => i });
        
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        // PHASE 1 — sequential vertical slot reveal
        panels.forEach((panel, i) => {
          tl.to(panel, { yPercent: 0, duration: 0.65 });
          tl.to({}, { duration: i === panels.length - 1 ? 0.6 : 0.2 });
        });

        // PHASE 2 — remove clip, spread cards into fan
        tl.call(() => {
          deck.style.overflow = "visible";
        });

        tl.add("reveal", "+=0.2");

        // PHASE 3 — Lift the black curtain FIRST
        tl.to(
          bg,
          {
            yPercent: -100,
            duration: 1.5,
            ease: "expo.out",
          },
          "reveal"
        );

        const SPREAD = isDesktop ? 11 : 9;
        const CARD_SCALE = isDesktop ? 0.88 : 0.72;

        const slots = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
        const rotations = [-15, -9, -3, 3, 9, 15];
        const yOffsets = isDesktop ? [38, 14, 2, 2, 14, 38] : [20, 8, 1, 1, 8, 20];

        // PHASE 4 — Spread cards and attach hover effects
        panels.forEach((panel, i) => {
          tl.to(
            panel,
            {
              x: `${slots[i] * SPREAD}vw`,
              y: yOffsets[i],
              scale: CARD_SCALE,
              rotation: rotations[i],
              duration: 1.2,
              ease: "power3.inOut",
            },
            "reveal+=0.3"
          );

          // HOVER LOGIC
          const onMouseEnter = () => {
            // Prevent hover if the main timeline is still playing
            if (tl.progress() < 1) return;
            
            gsap.to(panel, {
              y: yOffsets[i] - 30, // Move up by 30px
              scale: CARD_SCALE + 0.05, // Slightly increase scale
              zIndex: 50, // Bring to the absolute front
              duration: 0.4,
              ease: "power3.out",
              overwrite: "auto" // Prevent animation conflicts
            });
          };

          const onMouseLeave = () => {
            // Prevent leave if the main timeline is still playing
            if (tl.progress() < 1) return;
            
            gsap.to(panel, {
              y: yOffsets[i], // Restore original Y position
              scale: CARD_SCALE, // Restore original scale
              zIndex: i, // Restore original stacking order
              duration: 0.4,
              ease: "power3.out",
              overwrite: "auto"
            });
          };

          panel.addEventListener("mouseenter", onMouseEnter);
          panel.addEventListener("mouseleave", onMouseLeave);

          // Cleanup event listeners for React strict mode
          return () => {
            panel.removeEventListener("mouseenter", onMouseEnter);
            panel.removeEventListener("mouseleave", onMouseLeave);
          };
        });
      }
    );

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <div ref={sectionRef} className="relative w-full min-h-screen bg-white overflow-hidden text-black">
      
      {/* LAYER 1: The Real Content */}
      <div className="absolute inset-0 z-10 flex flex-col">
        <header className="w-full flex justify-center md:justify-between items-center p-6 md:p-8 uppercase tracking-[0.2em] text-xs md:text-sm">
          <div className="font-bold text-lg md:text-xl">STRUCT</div>
        </header>
      </div>

      {/* LAYER 2: The Black Curtain */}
      <div ref={bgRef} className="absolute inset-0 bg-black z-20"></div>

      {/* LAYER 3: The Cards */}
      <div className="absolute inset-0 flex justify-center items-center z-30 pointer-events-none">
        <div ref={deckRef} className="relative -mt-40 md:-mt-45 w-32 h-40 md:w-64 md:h-64 overflow-hidden pointer-events-auto">
          {/* We added absolute positioning earlier, make sure cursor-pointer is there for good UX */}
          <div className="panel absolute inset-0 bg-blue-300 flex items-center justify-center shadow-2xl rounded-sm cursor-pointer">Blue</div>
          <div className="panel absolute inset-0 bg-green-300 flex items-center justify-center shadow-2xl rounded-sm cursor-pointer">Green</div>
          <div className="panel absolute inset-0 bg-rose-300 flex items-center justify-center shadow-2xl rounded-sm cursor-pointer">Rose</div>
          <div className="panel absolute inset-0 bg-lime-300 flex items-center justify-center shadow-2xl rounded-sm cursor-pointer">Lime</div>
          <div className="panel absolute inset-0 bg-amber-700 flex items-center justify-center shadow-2xl rounded-sm cursor-pointer">Amber</div>
          <div className="panel absolute inset-0 bg-fuchsia-500 flex items-center justify-center shadow-2xl rounded-sm cursor-pointer">Fuchsia</div>
        </div>
      </div>

    </div>
  );
}