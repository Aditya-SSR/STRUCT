"use client";

import React, { useRef } from "react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function Line({ children, animateOnScroll = true, delay = 0 }) {
  const containerRef = useRef(null);
  const elementRef   = useRef([]);
  const splitRef     = useRef([]);
  const lines        = useRef([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      splitRef.current   = [];
      elementRef.current = [];
      lines.current      = [];


      let elements = [];
      if (containerRef.current.hasAttribute("data-copy-wrapper")) {
        elements = Array.from(containerRef.current.children);
      } else {
        elements = [containerRef.current];
      }

      // Split each element into lines and store references
      elements.forEach((element) => {
        elementRef.current.push(element);

        const split = SplitText.create(element, {
          type:       "lines",
          mask:       "lines",
          linesClass: "line++",
        });

        splitRef.current.push(split);

        // Preserve text-indent: move it to paddingLeft on the first line
        // so it survives the split, then zero out the original property
        const computedStyle = window.getComputedStyle(element);
        const textIndent    = computedStyle.textIndent;

        if (textIndent && textIndent !== "0px") {
          if (split.lines.length > 0) {
            split.lines[0].style.paddingLeft = textIndent;
          }
          element.style.textIndent = "0";
        }

        lines.current.push(...split.lines);
      });

      // Set every line to start below its mask (hidden)
      gsap.set(lines.current, { y: "100%" });

      // Build animation props
      const animationProps = {
        y:        "0%",
        duration: 1,
        stagger:  0.1,
        ease:     "power4.out",
        delay:    delay,
      };

      // Scroll-triggered or immediate
      if (animateOnScroll) {
        gsap.to(lines.current, {
          ...animationProps,
          scrollTrigger: {
            trigger: containerRef.current,
            start:   "top 75%",
            once:    true,
          },
        });
      } else {
        gsap.to(lines.current, animationProps);
      }

      // Cleanup: revert SplitText instances when component unmounts / deps change
      return () => {
        splitRef.current.forEach((split) => {
          if (split) split.revert();
        });
      };
    },
    {
      scope:        containerRef,
      dependencies: [animateOnScroll, delay],
    }
  );

  // Single child → clone and attach ref directly (no wrapper div needed)
  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, { ref: containerRef });
  }

  // Multiple children → wrap in a div with the sentinel attribute
  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  );
}