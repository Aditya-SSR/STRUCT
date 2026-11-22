"use client";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { pointer } from "./usePointer";

type Opts = {
  reduced: boolean;
  /** radians per second about Y */
  spin?: number;
  /** pointer tilt in radians */
  tilt?: number;
  baseX?: number;
  /** if set, sway ±sway radians about Y instead of spinning continuously (keeps thin objects readable) */
  sway?: number;
};

/** Slow drift + damped pointer tilt for a decorative object. Static pose when reduced. */
export function useDrift({ reduced, spin = 0.18, tilt = 0.18, baseX = 0, sway }: Opts) {
  const ref = useRef<Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (reduced) {
      g.rotation.set(baseX, 0.35, 0);
      return;
    }
    const d = Math.min(dt, 0.05);
    t.current += d;
    if (sway) g.rotation.y = 0.45 + Math.sin(t.current * spin * 2) * sway;
    else g.rotation.y += spin * d;
    g.rotation.x = MathUtils.damp(g.rotation.x, baseX - pointer.y * tilt, 3, d);
    g.rotation.z = MathUtils.damp(g.rotation.z, pointer.x * tilt * 0.5, 3, d);
  });
  return ref;
}

/**
 * Uniform scale so a `w` × `h` world-unit footprint fills ~`fill` of the viewport at the origin
 * (camera is assumed to look at the origin). Apply as `<group scale={useFit(...)}>`.
 */
export function useFit(w: number, h: number, fill = 0.82): number {
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  const fov = (camera as { fov?: number }).fov ?? 30;
  const visH = 2 * camera.position.length() * Math.tan(MathUtils.degToRad(fov) / 2);
  const visW = visH * (size.width / Math.max(1, size.height));
  return Math.min((visW * fill) / w, (visH * fill) / h);
}
