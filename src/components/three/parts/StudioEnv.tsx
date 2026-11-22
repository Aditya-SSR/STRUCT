"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** Soft studio IBL generated in memory from three's RoomEnvironment — no HDR download, no network. */
export default function StudioEnv({ intensity = 0.6 }: { intensity?: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    /* eslint-disable react-hooks/immutability -- three.js scene graph is intentionally mutable */
    scene.environment = target.texture;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      /* eslint-enable react-hooks/immutability */
      target.dispose();
      pmrem.dispose();
      room.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
}
