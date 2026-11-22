"use client";
import { forwardRef, useEffect, useMemo } from "react";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, ShaderMaterial, type Mesh } from "three";

type Props = {
  /** number of half-twists (odd = true Möbius strip) */
  twist?: number;
  radius?: number;
  width?: number;
  /** rim-light strength: ~1 on ink, ~0.35 on paper */
  rim?: number;
  segments?: number;
};

function buildRibbon(twist: number, R: number, W: number, segU: number, segV: number): BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segU; i++) {
    const u = (i / segU) * Math.PI * 2;
    const a = (u * twist) / 2;
    for (let j = 0; j <= segV; j++) {
      const v = ((j / segV) * 2 - 1) * W;
      const r = R + v * Math.cos(a);
      pos.push(r * Math.cos(u), r * Math.sin(u), v * Math.sin(a));
      uv.push(i / segU, j / segV);
    }
  }
  const row = segV + 1;
  for (let i = 0; i < segU; i++) {
    for (let j = 0; j < segV; j++) {
      const a = i * row + j;
      idx.push(a, a + row, a + 1, a + 1, a + row, a + row + 1);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

const VERT = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

// Black tape body with a crisp white load line down the centre, mm-ticks along the edges and a rim light.
// Values are linear; tone mapping + sRGB encode come from the chunks at the end.
const FRAG = /* glsl */ `
uniform float uRim; uniform float uLineW; uniform float uTicks;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 N = normalize(vN); if(!gl_FrontFacing) N = -N;
  vec3 V = normalize(vV);
  vec3 L = normalize(vec3(-0.45, 0.75, 0.6));
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float key = clamp(dot(N, L), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 4.0);
  float spec = pow(clamp(dot(N, normalize(L + V)), 0.0, 1.0), 56.0);
  vec3 col = vec3(0.012) + vec3(0.05) * key + uRim * (fres * vec3(0.42, 0.45, 0.5) + spec * 0.3);

  float d = abs(vUv.y - 0.5) * 2.0;
  float aa = max(fwidth(d), 1e-4);
  float line = 1.0 - smoothstep(uLineW - aa, uLineW + aa, d);
  vec3 tape = vec3(0.74 + 0.5 * key + 0.2 * fres);

  float tx = vUv.x * uTicks;
  float dash = smoothstep(0.5 - fwidth(tx), 0.5 + fwidth(tx), fract(tx));
  float band = smoothstep(0.80 - aa, 0.80 + aa, d) * (1.0 - smoothstep(0.88 - aa, 0.88 + aa, d));
  float rim = smoothstep(0.972 - aa, 0.972 + aa, d);

  col = mix(col, tape * 0.55, band * dash * 0.5);
  col = mix(col, tape * 0.35, rim * 0.6);
  col = mix(col, tape, line);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** Twisted, double-sided ribbon (Möbius for odd twist). Black with a white load line. */
const RibbonMesh = forwardRef<Mesh, Props>(function RibbonMesh(
  { twist = 3, radius = 2.2, width = 0.78, rim = 1, segments = 320 },
  ref,
) {
  const geo = useMemo(() => buildRibbon(twist, radius, width, segments, 8), [twist, radius, width, segments]);
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        side: DoubleSide,
        uniforms: { uRim: { value: rim }, uLineW: { value: 0.13 }, uTicks: { value: 120 } },
      }),
    [rim],
  );
  useEffect(() => () => geo.dispose(), [geo]);
  useEffect(() => () => mat.dispose(), [mat]);
  return <mesh ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
});

export default RibbonMesh;
