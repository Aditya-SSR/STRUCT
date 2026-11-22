"use client";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, MeshBasicMaterial, MathUtils, Object3D, SphereGeometry } from "three";
import { INK, PAPER, type Tone } from "./kit";
import { pointer } from "./usePointer";

type Props = { tone: Tone; reduced: boolean; small: boolean };

const SPACING = 0.16;

/** Instanced dot-grid wave. Dots rise and swell as a slow wave passes; the pointer adds a soft ripple. */
export default function DotWave({ tone, reduced, small }: Props) {
  const n = small ? 26 : 38;
  const count = n * n;
  const ref = useRef<InstancedMesh>(null);
  const t = useRef(0);
  const dummy = useMemo(() => new Object3D(), []);
  const geo = useMemo(() => new SphereGeometry(0.5, 8, 6), []);
  const mat = useMemo(() => new MeshBasicMaterial({ toneMapped: false }), []);
  useEffect(() => () => geo.dispose(), [geo]);
  useEffect(() => () => mat.dispose(), [mat]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const fg = new Color(tone === "noir" ? PAPER : INK);
    const bg = new Color(tone === "noir" ? INK : PAPER);
    const c = new Color();
    const half = (n - 1) / 2;
    for (let i = 0; i < count; i++) {
      const x = i % n;
      const z = Math.floor(i / n);
      const r = Math.hypot(x - half, z - half) / half;
      m.setColorAt(i, c.copy(fg).lerp(bg, MathUtils.clamp(Math.pow(r, 1.7) * 1.05, 0, 0.97)));
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [tone, n, count]);

  const place = (time: number, px: number, pz: number) => {
    const m = ref.current;
    if (!m) return;
    const half = (n - 1) / 2;
    for (let i = 0; i < count; i++) {
      const gx = i % n;
      const gz = Math.floor(i / n);
      const x = (gx - half) * SPACING;
      const z = (gz - half) * SPACING;
      const w = Math.sin(x * 1.5 + time * 1.1) * 0.5 + Math.cos(z * 1.7 - time * 0.8) * 0.5;
      const ripple = Math.exp(-((x - px) ** 2 + (z - pz) ** 2) * 3.2) * Math.sin(time * 4 - Math.hypot(x - px, z - pz) * 7);
      const h = w * 0.28 + ripple * 0.12;
      const s = 0.062 + (h + 0.4) * 0.07;
      dummy.position.set(x, h, z);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => place(0.7, 9, 9)); // static pose (reduced motion / first frame)
  useFrame((_, dt) => {
    if (reduced) return;
    t.current += Math.min(dt, 0.05);
    place(t.current + 0.7, pointer.x * 2.4, -pointer.y * 1.4);
  });

  return <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />;
}
