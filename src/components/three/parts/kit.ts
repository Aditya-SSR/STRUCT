"use client";
import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
  BufferGeometry,
  LineBasicMaterial,
  LinearMipmapLinearFilter,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  type Texture,
} from "three";

export type Tone = "noir" | "blanc";

export const INK = "#0a0a0a";
export const PAPER = "#f3f4f2";
export const ASH = "#b9bebf";
export const SIGNAL = "#ff5a00";

/** Soft rectangular contact-shadow sprite (black with blurred alpha). The solid core covers 48/128 of the texture. */
function blobTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.shadowColor = "rgba(0,0,0,1)";
  g.shadowBlur = 22;
  g.shadowOffsetX = 1000;
  g.fillStyle = "#000";
  g.fillRect(40 - 1000, 40, 48, 48);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Black slab face with two thin white load lines (echoes the trouser tapes). */
export function stripeTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0b0b0b";
  g.fillRect(0, 0, 128, 512);
  g.fillStyle = "#f3f4f2";
  g.fillRect(30, 0, 10, 512);
  g.fillRect(88, 0, 10, 512);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  t.minFilter = LinearMipmapLinearFilter;
  return t;
}

export type Kit = {
  box: BoxGeometry;
  edges: EdgesGeometry;
  plane: PlaneGeometry;
  body: MeshStandardMaterial;
  edge: LineBasicMaterial;
  blob: MeshBasicMaterial;
  blobTex: Texture;
  dispose: () => void;
};

/** Shared geometry + materials for monolith scenes (one unit box, scaled per block). */
export function useKit(tone: Tone): Kit {
  const kit = useMemo<Kit>(() => {
    const noir = tone === "noir";
    const box = new BoxGeometry(1, 1, 1);
    const edges = new EdgesGeometry(box);
    const plane = new PlaneGeometry(1, 1);
    plane.rotateX(-Math.PI / 2);
    const body = new MeshStandardMaterial({
      color: noir ? "#111111" : "#f3f4f2",
      roughness: noir ? 0.4 : 0.94,
      metalness: 0,
      polygonOffset: true, // keeps hairline edges from z-fighting with faces
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const edge = new LineBasicMaterial({ color: noir ? PAPER : INK });
    const blobTex = blobTexture();
    const blob = new MeshBasicMaterial({
      map: blobTex,
      color: "#000",
      transparent: true,
      opacity: noir ? 0 : 0.5,
      depthWrite: false,
      toneMapped: false,
    });
    return {
      box,
      edges,
      plane,
      body,
      edge,
      blob,
      blobTex,
      dispose: () => [box, edges, plane, body, edge, blob, blobTex].forEach((d) => d.dispose()),
    };
  }, [tone]);
  useEffect(() => () => kit.dispose(), [kit]);
  return kit;
}

/** Hairline floor grid that fades into the background colour with distance. */
export function gridGeometry(half: number, step = 1, bg: string, line: string): BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const a = new Color(line);
  const b = new Color(bg);
  const tmp = new Color();
  const push = (x: number, z: number) => {
    pos.push(x, 0, z);
    const t = Math.min(1, Math.hypot(x, z) / half);
    tmp.copy(a).lerp(b, Math.pow(t, 1.4));
    col.push(tmp.r, tmp.g, tmp.b);
  };
  for (let i = -half; i <= half; i += step) {
    for (let j = -half; j < half; j += step) {
      push(i, j);
      push(i, j + step);
      push(j, i);
      push(j + step, i);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new Float32BufferAttribute(col, 3));
  return g;
}
