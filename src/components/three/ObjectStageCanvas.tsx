"use client";
import type { StageState } from "./parts/StageHost";
import Stage from "./parts/Stage";
import Cluster from "./parts/Cluster";
import Monolith from "./parts/Monolith";
import RibbonMesh from "./parts/RibbonMesh";
import Ring from "./parts/Ring";
import DotWave from "./parts/DotWave";
import { useKit, type Tone } from "./parts/kit";
import { useDrift, useFit } from "./parts/useDrift";
import { usePointer } from "./parts/usePointer";

export type ObjectKind = "ring" | "slab" | "cluster" | "ribbon" | "dots";

const CAM_POS: [number, number, number] = [0, 0, 12];

type PieceProps = { tone: Tone; reduced: boolean; small: boolean };

function RingPiece({ tone, reduced }: PieceProps) {
  const drift = useDrift({ reduced, spin: 0.22, tilt: 0.25, baseX: 1.05 });
  const scale = useFit(2.5, 2.5, 0.86);
  return (
    <group scale={scale}>
      <group ref={drift}>
        <Ring tone={tone} />
      </group>
    </group>
  );
}

function SlabPiece({ tone, reduced }: PieceProps) {
  const kit = useKit(tone);
  const drift = useDrift({ reduced, spin: 0.2, tilt: 0.1, sway: 0.55 });
  const scale = useFit(2.4, 3.1, 0.86);
  // two hairline load lines running the full height of the front face
  const line = tone === "noir" ? "#f3f4f2" : "#0a0a0a";
  return (
    <group scale={scale}>
      <group ref={drift}>
        <Monolith kit={kit} at={[0, -1.4, 0]} size={[1.3, 2.8, 0.5]} blob={tone === "blanc"} />
        {[-0.3, 0.3].map((x) => (
          <lineSegments key={x} position={[x, 0, 0.252]}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[new Float32Array([0, -1.4, 0, 0, 1.4, 0]), 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={line} />
          </lineSegments>
        ))}
      </group>
    </group>
  );
}

function ClusterPiece({ tone, reduced, small }: PieceProps) {
  const kit = useKit(tone);
  const drift = useDrift({ reduced, spin: 0.22, tilt: 0.12, sway: 0.5 });
  const scale = useFit(4.8, 3.6, 0.86);
  return (
    <group scale={scale}>
      <group ref={drift}>
        <group position={[-0.15, -1.4, 0]}>
          <Cluster kit={kit} mini slab={false} reduced={reduced} shadow={false} simple={small} />
        </group>
      </group>
    </group>
  );
}

function RibbonPiece({ tone, reduced, small }: PieceProps) {
  const drift = useDrift({ reduced, spin: 0.3, tilt: 0.3, baseX: 1.0 });
  const scale = useFit(6.6, 4.4, 0.9);
  return (
    <group scale={scale}>
      <group ref={drift}>
        <RibbonMesh twist={3} radius={2.35} width={0.82} rim={tone === "noir" ? 1 : 0.4} segments={small ? 180 : 300} />
      </group>
    </group>
  );
}

function DotsPiece({ tone, reduced, small }: PieceProps) {
  const scale = useFit(6.4, 4.6, 0.8);
  return (
    <group scale={scale} rotation={[0.8, 0, 0]}>
      <DotWave tone={tone} reduced={reduced} small={small} />
    </group>
  );
}

function Piece({ kind, ...rest }: PieceProps & { kind: ObjectKind }) {
  usePointer();
  switch (kind) {
    case "ring":
      return <RingPiece {...rest} />;
    case "slab":
      return <SlabPiece {...rest} />;
    case "cluster":
      return <ClusterPiece {...rest} />;
    case "ribbon":
      return <RibbonPiece {...rest} />;
    default:
      return <DotsPiece {...rest} />;
  }
}

export default function ObjectStageCanvas({ kind, tone, active, reduced, small, onReady }: { kind: ObjectKind; tone: Tone } & StageState) {
  const noir = tone === "noir";
  return (
    <Stage active={active} reduced={reduced} small={small} onReady={onReady} fov={30} position={CAM_POS} env={kind === "dots" ? 0 : noir ? 0.5 : 0.6}>
      <directionalLight position={[4, 6, 6]} intensity={noir ? 2.2 : 3.2} />
      <directionalLight position={[-6, 2, 3]} intensity={noir ? 0.6 : 0.8} />
      {noir ? <directionalLight position={[-2, 3, -6]} intensity={4} color="#e8f0ff" /> : null}
      <Piece kind={kind} tone={tone} reduced={reduced} small={small} />
    </Stage>
  );
}
