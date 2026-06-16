"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function ZoomReveal() {
  const containerRef = useRef(null);
  const collectionRef = useRef(null);
  const overlayRef = useRef(null);
  const dropRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 1,
        },
      });

      // 1. Zoom text massively first
      tl.to(
        collectionRef.current,
        {
          scale: 100,
          ease: "power2.in",
        },
        0
      );

      // 2. Delay the dot scale until text is already huge
      tl.to(
        overlayRef.current,
        {
          scale: 150,
          ease: "power1.inOut",
        },
        0.4
      );

      // 3. Fade out the giant text smoothly
      tl.to(
        collectionRef.current,
        {
          opacity: 0,
          ease: "none",
        },
        0.5
      );

      // 4. Reveal DROP-01
      tl.to(
        dropRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "power2.out",
        },
        0.6
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-white flex items-center justify-center"
    >
      {/* Black expanding layer */}
      <div
        ref={overlayRef}
        className="absolute w-12 h-12 rounded-full bg-black z-10"
        style={{
          transform: "scale(0)",
        }}
      />

      {/* COLLECTION */}
      <h1
        ref={collectionRef}
        className="absolute z-20 text-[15vw] font-black uppercase text-black leading-none"
      >
        COLLECTION
      </h1>

      {/* DROP-01 */}
      <h2
        ref={dropRef}
        className="absolute z-30 text-white text-[10vw] font-black"
        style={{
          opacity: 0,
          transform: "translateY(40px) scale(0.8)",
        }}
      >
        DROP-01
      </h2>
    </section>
  );
}