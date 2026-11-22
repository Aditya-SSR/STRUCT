"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import type { StageState } from "./parts/StageHost";
import Stage from "./parts/Stage";
import Cluster from "./parts/Cluster";
import Floor from "./parts/Floor";
import { useKit } from "./parts/kit";
import { pointer, usePointer } from "./parts/usePointer";

const FOV = 28;
const CAM_POS: [number, number, number] = [-6, 4, 20];
const TAN = Math.tan(MathUtils.degToRad(FOV / 2));
const TARGET = new Vector3(1.0, 1.55, 0);
const CLUSTER_W = 9.6; // world width of the cluster incl. slab
const CLUSTER_H = 4.4;

/** Frames the cluster to the right/centre of the viewport and orbits the camera very slowly (+ pointer parallax). */
function Rig({ reduced, small }: { reduced: boolean; small: boolean }) {
  usePointer();
  const kit = useKit("blanc");
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  const t = useRef(0);
  const p = useRef({ x: 0, y: 0 });

  const aspect = size.width / Math.max(1, size.height);
  const portrait = aspect < 0.9;
  const mid = !portrait && aspect < 1.3;
  // share of the viewport width the cluster should occupy, and how far to push it right / down
  const frac = portrait ? 0.86 : mid ? 0.78 : 0.56;
  const shiftX = portrait ? 0 : mid ? 0.09 : 0.2;
  const shiftY = portrait ? 0.13 : 0;
  const dist = Math.max(CLUSTER_W / frac / aspect, CLUSTER_H / 0.62) / (2 * TAN);

  useEffect(() => {
    const cam = camera as import("three").PerspectiveCamera;
    cam.setViewOffset(size.width, size.height, -shiftX * size.width, -shiftY * size.height, size.width, size.height);
    return () => cam.clearViewOffset();
  }, [camera, size.width, size.height, shiftX, shiftY]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    if (!reduced) {
      t.current += d;
      p.current.x = MathUtils.damp(p.current.x, pointer.x, 2.2, d);
      p.current.y = MathUtils.damp(p.current.y, pointer.y, 2.2, d);
    }
    const az = -0.5 + Math.sin(t.current * 0.13) * 0.09 + p.current.x * 0.11;
    const el = 0.2 + p.current.y * 0.035;
    camera.position.set(
      TARGET.x + Math.sin(az) * Math.cos(el) * dist,
      TARGET.y + Math.sin(el) * dist,
      TARGET.z + Math.cos(az) * Math.cos(el) * dist,
    );
    camera.lookAt(TARGET);
  });

  return (
    <>
      <directionalLight
        position={[7, 10, 6]}
        intensity={3.4}
        castShadow={!small}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={5}
      />
      <directionalLight position={[-8, 3, 4]} intensity={0.8} />
      <Floor tone="blanc" grid={small ? 0 : 16} catchShadow={!small} />
      <Cluster kit={kit} simple={small} reduced={reduced} shadow={!small} />
    </>
  );
}

export default function HeroSceneCanvas({ active, reduced, small, onReady }: StageState) {
  return (
    <Stage active={active} reduced={reduced} small={small} onReady={onReady} fov={FOV} position={CAM_POS} shadows env={0.55}>
      <Rig reduced={reduced} small={small} />
    </Stage>
  );
}
