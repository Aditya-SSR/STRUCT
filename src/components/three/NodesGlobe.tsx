"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { Node } from "@/data/brand";
import { hasWebGL } from "./parts/env";
import { createGlobeController, type GlobeController } from "./globeController";

const subscribeNone = () => () => {};

type Props = {
  nodes: Node[];
  activeId: string | null;
  /** bump to re-centre on the active node even if it did not change */
  focusSeq: number;
  className?: string;
};

/**
 * Draggable cobe globe: dark dotted sphere, orange node markers, arcs from the origin. Motion lives in
 * `globeController.ts` (time-based idle spin, inertial drag, shortest-path spring glide, off-screen pause).
 */
export default function NodesGlobe({ nodes, activeId, focusSeq, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const ctl = useRef<GlobeController | null>(null);
  const latest = useRef({ activeId, nodes });
  const noGL = !useSyncExternalStore(subscribeNone, hasWebGL, () => true);

  // keep the latest props readable from the long-lived effect below (declared first so it runs first)
  useEffect(() => {
    latest.current = { activeId, nodes };
  });

  useEffect(() => {
    const el = host.current;
    if (!el || !hasWebGL()) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(max-width: 767px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);

    const canvas = document.createElement("canvas");
    // pan-y: horizontal drags rotate the globe, vertical swipes still scroll the page on touch
    canvas.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab;";
    el.appendChild(canvas);

    const c = createGlobeController({ canvas, host: el, nodes: latest.current.nodes, activeId: latest.current.activeId, reduced, coarse, dpr });
    ctl.current = c;
    (el as HTMLElement & { __globe?: GlobeController }).__globe = c;
    return () => {
      ctl.current = null;
      c.destroy();
      el.replaceChildren();
    };
  }, []);

  useEffect(() => {
    ctl.current?.setActive(activeId);
  }, [activeId]);
  useEffect(() => {
    if (focusSeq > 0) ctl.current?.focus(activeId);
  }, [focusSeq, activeId]);

  return (
    <div
      className={`relative aspect-square w-full select-none ${className}`}
      data-cursor="DRAG"
      role="img"
      aria-label="Dotted globe showing the eight STRUCT nodes. Drag to rotate."
    >
      <div ref={host} className="absolute inset-0" />
      {noGL ? (
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full opacity-40" fill="none" stroke="currentColor" strokeWidth="0.6">
          <circle cx="100" cy="100" r="80" />
          <ellipse cx="100" cy="100" rx="80" ry="30" />
          <ellipse cx="100" cy="100" rx="30" ry="80" />
          <path d="M20 100h160M100 20v160" />
        </svg>
      ) : null}
    </div>
  );
}
