"use client";
import { useEffect, useMemo, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { NeutralToneMapping } from "three";
import type { StageState } from "./StageHost";
import StudioEnv from "./StudioEnv";

// stable config objects (R3F re-applies `gl` / `camera` when identity changes)
const GL_AA = { antialias: true, alpha: true, powerPreference: "high-performance" as const, stencil: false, toneMapping: NeutralToneMapping };
const GL_NOAA = { ...GL_AA, antialias: false };
const RESIZE = { scroll: false };

type Props = Pick<StageState, "active" | "reduced" | "small" | "onReady"> & {
  fov?: number;
  position?: [number, number, number];
  /** enable the directional-light shadow map (desktop only) */
  shadows?: boolean;
  /** studio environment intensity; 0 = none */
  env?: number;
  children: ReactNode;
};

/** In demand mode (reduced motion) make sure a frame is drawn whenever we (re)activate. */
function Kick({ active, reduced }: { active: boolean; reduced: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (active) invalidate();
  }, [active, reduced, invalidate]);
  return null;
}

/**
 * Phones: the scenes are slow drifts, so they are rendered on demand at ~30 fps instead of every display frame
 * (halves the main-thread cost of three.js + the canvas commit, invisible on a slow rotation).
 */
function Pace({ active, fps }: { active: boolean; fps: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = 0;
    const gap = 1000 / fps - 3;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last >= gap) {
        last = t;
        invalidate();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, fps, invalidate]);
  return null;
}

/**
 * Shared R3F canvas: transparent, Khronos-neutral tone mapping (whites stay white), capped DPR, frame loop that
 * pauses when off-screen (`never`) and renders on demand under reduced motion, studio environment built in-memory.
 */
export default function Stage({ active, reduced, small, onReady, fov = 30, position = [0, 0, 10], shadows, env = 0.6, children }: Props) {
  const camera = useMemo(() => ({ fov, position, near: 0.1, far: 120 }), [fov, position]);
  return (
    <Canvas
      frameloop={!active ? "never" : reduced || small ? "demand" : "always"}
      dpr={[1, small ? 1.5 : 1.75]}
      shadows={shadows && !small ? "percentage" : false}
      gl={small ? GL_NOAA : GL_AA}
      camera={camera}
      resize={RESIZE}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        requestAnimationFrame(() => requestAnimationFrame(onReady));
      }}
    >
      <Kick active={active} reduced={reduced} />
      {small && !reduced ? <Pace active={active} fps={30} /> : null}
      {env > 0 ? <StudioEnv intensity={env} /> : null}
      {children}
    </Canvas>
  );
}
