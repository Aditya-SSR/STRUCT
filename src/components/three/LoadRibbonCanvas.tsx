"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group, type Mesh } from "three";
import type { StageState } from "./parts/StageHost";
import Stage from "./parts/Stage";
import RibbonMesh from "./parts/RibbonMesh";
import { useFit } from "./parts/useDrift";
import { pointer, usePointer } from "./parts/usePointer";

const CAM_POS: [number, number, number] = [0, 0, 11];

function Ribbon({ reduced, small }: { reduced: boolean; small: boolean }) {
  usePointer();
  const tilt = useRef<Group>(null);
  const spinner = useRef<Mesh>(null);
  const state = useRef({ spin: 0.6, px: 0, py: 0, sv: 0, last: 0, t: 0 });
  const scale = useFit(6.6, 4.6, small ? 1.0 : 0.9);

  useFrame((_, dt) => {
    const g = tilt.current;
    const m = spinner.current;
    if (!g || !m) return;
    const s = state.current;
    if (reduced) {
      g.rotation.set(1.05, 0.2, 0);
      m.rotation.z = s.spin;
      return;
    }
    const d = Math.min(dt, 0.05);
    s.t += d;
    // window scroll velocity (px/s), smoothed — Lenis drives native scroll so scrollY is the smoothed value
    const y = window.scrollY;
    if (s.t < 0.1) s.last = y;
    const v = (y - s.last) / Math.max(d, 1e-3);
    s.last = y;
    s.sv = MathUtils.damp(s.sv, MathUtils.clamp(v, -6000, 6000), 5, d);
    s.px = MathUtils.damp(s.px, pointer.x, 2.4, d);
    s.py = MathUtils.damp(s.py, pointer.y, 2.4, d);

    s.spin += (0.12 + s.sv * 0.0011) * d;
    m.rotation.z = s.spin;
    g.rotation.x = 1.05 + s.py * 0.22 + Math.sin(s.t * 0.21) * 0.05;
    g.rotation.y = 0.2 + s.px * 0.38;
    g.rotation.z = -s.px * 0.08;
    const stretch = 1 + Math.min(Math.abs(s.sv) * 0.00005, 0.1);
    g.scale.set(stretch, 1 / Math.sqrt(stretch), 1);
  });

  return (
    <group scale={scale}>
      <group ref={tilt}>
        <RibbonMesh ref={spinner} twist={3} radius={2.35} width={0.82} rim={1} segments={small ? 200 : 360} />
      </group>
    </group>
  );
}

export default function LoadRibbonCanvas({ active, reduced, small, onReady }: StageState) {
  return (
    <Stage active={active} reduced={reduced} small={small} onReady={onReady} fov={32} position={CAM_POS} env={0}>
      <Ribbon reduced={reduced} small={small} />
    </Stage>
  );
}
