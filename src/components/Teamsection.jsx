"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const TEAM = [
  {
    name: "COLIN",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "LIAM",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "TABITHA",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "TYSON",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "MAX",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "EVEREST",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "SIMON",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "GIDEON",
    img: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "BENTON",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face",
  },
];

export default function TeamSection() {
  const imageRefs = useRef([]);
  const squadCharsRef = useRef([]);
  const nameCharsRef = useRef([]);
  const squadHeadingRef = useRef(null);
  const nameHeadingRefs = useRef([]);

  useEffect(() => {
    // MAIN TITLE
    const squadSplit = new SplitText(squadHeadingRef.current, {
      type: "chars",
      charsClass: "team-char",
    });

    squadCharsRef.current = squadSplit.chars;

    // MEMBER NAMES
    nameHeadingRefs.current.forEach((el, i) => {
      if (!el) return;

      const split = new SplitText(el, {
        type: "chars",
        charsClass: "team-char",
      });

      nameCharsRef.current[i] = split.chars;

      gsap.set(split.chars, {
        yPercent: 110,
      });
    });

    imageRefs.current.forEach((img, index) => {
      const chars = nameCharsRef.current[index];

      const enter = () => {
        // IMAGE HOVER
        gsap.to(img, {
          scale: window.innerWidth < 768 ? 1.35 : 1.75,
          duration: 0.55,
          ease: "power3.out",
          zIndex: 20,
          overwrite: true, 
        });

        // HIDE THE SQUAD
        gsap.to(squadCharsRef.current, {
          yPercent: -110,
          duration: 0.8,
          ease: "power3.out",
          stagger: {
            each: 0.03,
            from: "center",
          },
          overwrite: true,
        });

        // SHOW MEMBER NAME
        gsap.to(chars, {
          yPercent: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: {
            each: 0.03,
            from: "center",
          },
          overwrite: true,
        });
      };

      const leave = () => {
        // RESET IMAGE
        gsap.to(img, {
          scale: 1,
          duration: 0.55,
          ease: "power3.out",
          zIndex: 1,
          overwrite: true, 
        });

        // RESTORE THE SQUAD
        gsap.to(squadCharsRef.current, {
          yPercent: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: {
            each: 0.03,
            from: "center",
          },
          overwrite: true, 
        });

        // HIDE MEMBER NAME
        gsap.to(chars, {
          yPercent: 110,
          duration: 0.85,
          ease: "power3.out",
          stagger: {
            each: 0.03,
            from: "center",
          },
          overwrite: true,
        });
      };

      // DESKTOP
      img.addEventListener("mouseenter", enter);
      img.addEventListener("mouseleave", leave);

      // MOBILE
      img.addEventListener("touchstart", enter);

      return () => {
        img.removeEventListener("mouseenter", enter);
        img.removeEventListener("mouseleave", leave);
        img.removeEventListener("touchstart", enter);
      };
    });

    return () => {
      squadSplit.revert();
    };
  }, []);

  return (
    <section className="w-full min-h-screen bg-[#080808] flex flex-col items-center justify-center overflow-hidden px-4 py-16">
      
      {/* IMAGE STRIP */}
      <div
        className="
          flex
          items-end
          justify-center
          flex-wrap
          max-w-275
          -mt-32      /* Moves images up on mobile */
          md:mt-0     /* Resets position on desktop */
          mb-16       /* Increased bottom margin for mobile to push text down */
          md:mb-14    /* Resets bottom margin on desktop */
          relative
          z-10
        "
        style={{
          gap: "16px",
        }}
      >
        {TEAM.map((member, i) => (
          <img
            key={member.name}
            ref={(el) => (imageRefs.current[i] = el)}
            src={member.img}
            alt={member.name}
            draggable="false"
            className="
              w-13.5
              h-13.5
              sm:w-16
              sm:h-16
              object-cover
              rounded-xl
              cursor-pointer
              shrink-0
              select-none
              relative
            "
            style={{
              transformOrigin: "bottom center",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          />
        ))}
      </div>

      {/* TEXT CONTAINER */}
      <div className="relative w-full flex items-center justify-center overflow-hidden">
        
        {/* MAIN TEXT */}
        <h1
          ref={squadHeadingRef}
          className="
            text-[#faf9f6]
            font-monument
            uppercase
            leading-[0.9]
            tracking-[-0.05em]
            whitespace-nowrap
            text-center
            select-none
            px-2
          "
          style={{
            /* Increased minimum font size and vw scaling for mobile */
            fontSize: "clamp(3.5rem, 15vw, 12rem)",
          }}
        >
          STRUCTS
        </h1>

        {/* MEMBER NAMES */}
        {TEAM.map((member, i) => (
          <h2
            key={member.name}
            ref={(el) => (nameHeadingRefs.current[i] = el)}
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              text-[#FF5A00]
              font-monument
              uppercase
              leading-[0.9]
              tracking-[-0.05em]
              whitespace-nowrap
              pointer-events-none
              select-none
              px-2
            "
            style={{
              /* Increased minimum font size and vw scaling for mobile */
              fontSize: "clamp(3.5rem, 15vw, 12rem)",
            }}
          >
            {member.name}
          </h2>
        ))}
      </div>
    </section>
  );
}