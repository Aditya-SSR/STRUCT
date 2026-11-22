"use client";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Color, InstancedMesh, MeshStandardMaterial, Object3D, TorusGeometry } from "three";
import { INK, PAPER, type Tone } from "./kit";

const N = 52;

/** Segmented striped torus: N separate arcs (black / white alternating) with hairline gaps — one instanced draw call. */
export default function Ring({ tone }: { tone: Tone }) {
  const ref = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new TorusGeometry(1, 0.2, 20, 6, ((Math.PI * 2) / N) * 0.88), []);
  const mat = useMemo(() => new MeshStandardMaterial({ roughness: tone === "noir" ? 0.45 : 0.7, metalness: 0 }), [tone]);
  useEffect(() => () => geo.dispose(), [geo]);
  useEffect(() => () => mat.dispose(), [mat]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new Object3D();
    const dark = new Color(tone === "noir" ? "#1c1c1c" : INK);
    const light = new Color(PAPER);
    for (let i = 0; i < N; i++) {
      o.rotation.set(0, 0, (i / N) * Math.PI * 2);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, i % 2 ? dark : light);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [tone]);
  return <instancedMesh ref={ref} args={[geo, mat, N]} castShadow />;
}
