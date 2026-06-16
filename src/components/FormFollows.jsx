"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Register plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

export default function FormFollows() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const paraRef = useRef(null);

  // Refs for static spans embedded in the paragraph
  const formStaticRef = useRef(null);
  const followsStaticRef = useRef(null);
  const functionStaticRef = useRef(null);

  // Refs for animated absolute spans
  const formAnimRef = useRef(null);
  const followsAnimRef = useRef(null);
  const functionAnimRef = useRef(null);

  useGSAP(() => {
    if (!paraRef.current) return;

    if (window.innerWidth <= 767) {
      ScrollTrigger.normalizeScroll(true);
    }

    const split = new SplitText(paraRef.current, { 
      type: "words", 
      wordsClass: "inline-block will-change-transform" 
    });

    const formStatic = formStaticRef.current;
    const followsStatic = followsStaticRef.current;
    const functionStatic = functionStaticRef.current;

    const formAnim = formAnimRef.current;
    const followsAnim = followsAnimRef.current;
    const functionAnim = functionAnimRef.current;

    gsap.set([formStatic, followsStatic, functionStatic], { visibility: "hidden" });
    gsap.set([formAnim, followsAnim, functionAnim], { visibility: "visible" });

    const matchLocation = (staticEl, animEl) => {
      gsap.set(animEl, { x: 0, y: 0 }); 
      const sRect = staticEl.getBoundingClientRect();
      const aRect = animEl.getBoundingClientRect();
      gsap.set(animEl, {
        x: sRect.left - aRect.left,
        y: sRect.top - aRect.top,
      });
    };

    const setLocations = () => {
      matchLocation(formStatic, formAnim);
      matchLocation(followsStatic, followsAnim);
      matchLocation(functionStatic, functionAnim);
    };

    setLocations();

    let tl;
    let mm = gsap.matchMedia();

    // The Magic Trick: Separate sizing logic for Mobile and Desktop
    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)"
    }, (context) => {
      let { isDesktop } = context.conditions;

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      tl.to(split.words, {
        opacity: 0,
        rotationZ: 30,
        rotationX: 40,
        yPercent: -300,
        xPercent: 100,
        stagger: 0.05,
      })
      .to([formAnim, followsAnim, functionAnim], {
        x: 0,
        y: 0,
        // Desktop gets the massive 8rem cap, Mobile gets safely capped at 1.25rem
        fontSize: isDesktop ? "clamp(2rem, 4.5vw, 8rem)" : "clamp(0.8rem, 4.5vw, 1.25rem)", 
        duration: 2,
        ease: "power2.inOut",
      });
    });

    const handleResize = () => {
      if (tl) {
        const progress = tl.progress();
        tl.progress(0); 
        setLocations();
        tl.progress(progress); 
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      split.revert();
      mm.revert();
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full overflow-clip bg-white text-black">
      <div className="container mx-auto">
        <div ref={trackRef} className="h-[500vh] relative">
          
          <div className="sticky top-0 min-h-screen flex flex-col justify-center items-center">
            
            <div className="absolute top-6 left-6 w-5 h-5 border-t border-l border-gray-300 opacity-60"></div>
            <div className="absolute bottom-6 right-6 w-5 h-5 border-b border-r border-gray-300 opacity-60"></div>

            <div className="relative flex justify-center items-center w-full max-w-344 px-4 md:px-12">
              
              <div className="absolute inset-0 flex justify-center items-center gap-1.5 md:gap-6 lg:gap-10 z-20 pointer-events-none whitespace-nowrap">
                <div ref={formAnimRef} className="font-monument text-black text-[clamp(1.25rem,2.5vw,2.5rem)] tracking-wide invisible">FORM</div>
                <div ref={followsAnimRef} className="font-monument text-black text-[clamp(1.25rem,2.5vw,2.5rem)] tracking-wide invisible">FOLLOWS</div>
                <div ref={functionAnimRef} className="font-monument text-black text-[clamp(1.25rem,2.5vw,2.5rem)] tracking-wide invisible">FUNCTION</div>
              </div>

              <p ref={paraRef} className="font-mono text-center text-[clamp(1.25rem,2.5vw,2.5rem)] leading-relaxed text-black tracking-wide z-10">
                We treat the human body as a rigid architectural{" "}
                <span ref={formStaticRef} className="font-monument text-[#FF5A00] tracking-wide inline-block">FORM</span>. 
                Every seam, joint, and panel we engineer strictly{" "}
                <span ref={followsStaticRef} className="font-monument text-[#FF5A00] tracking-wide inline-block">FOLLOWS</span>{" "}
                a code of absolute utility. We eliminate all decorative noise to deliver pure, uncompromised{" "}
                <span ref={functionStaticRef} className="font-monument text-[#FF5A00] tracking-wide inline-block">FUNCTION</span>.
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}