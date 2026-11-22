"use client";
import { useRef, useState, type PointerEvent, type MouseEvent } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { Person } from "@/data/brand";
import DotCanvas from "./DotCanvas";
import PortraitPhoto from "./PortraitPhoto";

const RING = 70; // lens radius the ring element is drawn at (it is scaled to the live radius)
const MASK = "radial-gradient(circle var(--lr) at var(--lx) var(--ly), #000 calc(100% - 1px), transparent 100%)";

type Api = { open: (x: number, y: number, r: number, instant?: boolean) => void; move: (x: number, y: number) => void; close: () => void };

/**
 * A dot-matrix portrait (canvas) with a pointer "lens": a ~140px circle that eases after the pointer and
 * resolves the real photograph through the dots. The lens is a CSS radial mask on a photo layer (no per-frame
 * canvas work). Touch: tap toggles a lens at that point. Keyboard: Enter/Space toggles a lens at the centre.
 * Reduced motion: no lens, tap/Enter toggles the whole photograph.
 */
export default function DotPortrait({ person, className = "" }: { person: Person; className?: string }) {
  const root = useRef<HTMLButtonElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const lastType = useRef("mouse");
  const [pressed, setPressed] = useState(false);
  const reduce = useRef(false);
  const [reduced, setReduced] = useState(false);

  useGSAP(
    () => {
      const l = lens.current;
      const rg = ring.current;
      reduce.current = prefersReducedMotion();
      setReduced(reduce.current);
      if (!l || !rg || reduce.current) return;
      const p = { x: 0, y: 0, r: 0 };
      const apply = () => {
        l.style.setProperty("--lx", `${p.x}px`);
        l.style.setProperty("--ly", `${p.y}px`);
        l.style.setProperty("--lr", `${Math.max(p.r, 0.01)}px`);
        l.style.visibility = p.r > 0.5 ? "visible" : "hidden";
        rg.style.transform = `translate3d(${p.x - RING}px, ${p.y - RING}px, 0) scale(${Math.max(p.r, 0) / RING})`;
      };
      const qx = gsap.quickTo(p, "x", { duration: 0.55, ease: "power3.out", onUpdate: apply });
      const qy = gsap.quickTo(p, "y", { duration: 0.55, ease: "power3.out", onUpdate: apply });
      const qr = gsap.quickTo(p, "r", { duration: 0.6, ease: "expo.out", onUpdate: apply });
      api.current = {
        open: (x, y, r, instant) => {
          if (p.r < 1 || instant) gsap.set(p, { x, y });
          else {
            qx(x);
            qy(y);
          }
          apply();
          qr(r);
        },
        move: (x, y) => {
          qx(x);
          qy(y);
        },
        close: () => qr(0),
      };
      apply();
      return () => {
        api.current = null;
      };
    },
    { scope: root },
  );

  const local = (e: { clientX: number; clientY: number }) => {
    const b = root.current!.getBoundingClientRect();
    return [e.clientX - b.left, e.clientY - b.top] as const;
  };

  const onEnter = (e: PointerEvent) => {
    lastType.current = e.pointerType;
    if (e.pointerType === "touch" || !api.current) return;
    api.current.open(...local(e), RING);
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch" || !api.current) return;
    api.current.move(...local(e));
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    api.current?.close();
    setPressed(false);
  };
  const onClick = (e: MouseEvent) => {
    const keyboard = e.detail === 0;
    const touch = lastType.current === "touch";
    if (!keyboard && !touch) return; // mouse: hover already drives the lens
    if (reduce.current || !api.current) {
      setPressed((v) => !v);
      return;
    }
    if (pressed) {
      api.current.close();
      setPressed(false);
      return;
    }
    const b = root.current!.getBoundingClientRect();
    if (keyboard) api.current.open(b.width / 2, b.height * 0.42, 100, true);
    else api.current.open(...local(e), 84, true);
    setPressed(true);
  };

  return (
    <button
      ref={root}
      type="button"
      aria-pressed={pressed}
      aria-label={`Resolve the photograph of ${person.name}`}
      data-cursor="RESOLVE"
      onPointerEnter={onEnter}
      onPointerDown={(e) => (lastType.current = e.pointerType)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onClick}
      className={`relative block w-full overflow-hidden bg-paper text-ink outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${className}`}
      style={{ aspectRatio: "4 / 5", touchAction: "manipulation" }}
    >
      <DotCanvas image={person.image} />
      {/* the real photograph, revealed through a circular mask that follows the pointer */}
      <div
        ref={lens}
        aria-hidden
        className="absolute inset-0 overflow-hidden"
        style={
          reduced
            ? { visibility: pressed ? "visible" : "hidden" }
            : { visibility: "hidden", maskImage: MASK, WebkitMaskImage: MASK }
        }
      >
        <PortraitPhoto image={person.image} alt="" />
      </div>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 rounded-full border border-ink/70"
        style={{ width: RING * 2, height: RING * 2, transform: "scale(0)", willChange: "transform" }}
      />
    </button>
  );
}
