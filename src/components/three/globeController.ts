import type { Arc, Globe, Marker } from "cobe";

/**
 * Framework-free controller for the cobe globe (cobe v2 has no loop of its own: every `update()` is one draw call).
 *
 * Camera model (derived from cobe's shaders): a point faces the camera exactly when
 *   phi = atan2(-cos(lon), -sin(lon)),  theta = lat.
 * Increasing phi turns the globe eastward (surface moves right), increasing theta tips the north pole toward us.
 *
 * Motion model — all time based (dt), never per-frame increments:
 *  · idle:  constant spin (rad/s) blended in/out by `auto`, theta eases back to a resting tilt
 *  · drag:  1:1 with the pointer at the disc centre, release velocity from a ~90 ms sample window, exponential inertia
 *  · focus: critically damped spring (exact analytic step) on the SHORTEST angular path, retarget-safe;
 *           after it settles the globe holds for a beat, then idle spin fades back in from where it is
 */

export type GlobeNode = { id: string; lat: number; lon: number; origin?: boolean };
type RGB = [number, number, number];

export const ORANGE: RGB = [1, 0.353, 0]; // #FF5A00
const ARC_DIM: RGB = [0.42, 0.44, 0.44];
const ARC_LIVE: RGB = [0.97, 0.97, 0.96];

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const wrapPi = (a: number) => a - TAU * Math.round(a / TAU); // → [-π, π], shortest signed angle
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

const SPIN = 0.16; // rad/s idle (~39 s per revolution)
const REST_THETA = 0.3; // gentle northern tilt for the idle state
const THETA_MIN = -0.45;
const THETA_MAX = 1.05;
const SCALE = 1.08; // cobe `scale`
const FOCUS_OMEGA = 3.4; // spring stiffness → settles in ~1.6 s with no overshoot
const HOLD_MS = 2600; // pause after a glide / a drag before idle spin resumes

export const markersFor = (nodes: GlobeNode[], activeId: string | null): Marker[] =>
  nodes.map((n) => ({
    location: [n.lat, n.lon],
    size: (n.origin ? 0.075 : 0.042) * (n.id === activeId ? 1.45 : 1),
    color: ORANGE,
  }));

export const arcsFor = (nodes: GlobeNode[], activeId: string | null): Arc[] => {
  const o = nodes.find((n) => n.origin);
  if (!o) return [];
  return nodes
    .filter((n) => !n.origin)
    .map((n) => ({ from: [o.lat, o.lon], to: [n.lat, n.lon], color: n.id === activeId ? ARC_LIVE : ARC_DIM }));
};

/** cobe angles that put lat/lon exactly at the centre of the disc. */
export const focusAngles = (lat: number, lon: number) => ({
  phi: Math.atan2(-Math.cos(lon * DEG), -Math.sin(lon * DEG)),
  theta: clamp(lat * DEG, THETA_MIN, THETA_MAX),
});

export type GlobeController = {
  /** glide to a node (shortest way round) and hold there for a beat */
  focus: (id: string | null) => void;
  /** restyle markers/arcs for the active node */
  setActive: (id: string | null) => void;
  /** current state, for tests/debug */
  readonly state: { phi: number; theta: number };
  destroy: () => void;
};

type Opts = {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  nodes: GlobeNode[];
  activeId: string | null;
  reduced: boolean;
  coarse: boolean;
  dpr: number;
};

export function createGlobeController({ canvas, host, nodes: initialNodes, activeId: initialActive, reduced, coarse, dpr }: Opts): GlobeController {
  const nodes = initialNodes;
  const first = nodes.find((n) => n.id === initialActive) ?? nodes.find((n) => n.origin) ?? nodes[0];
  const s = {
    ...focusAngles(first.lat, first.lon),
    vPhi: 0, // inertia (rad/s)
    vTheta: 0,
    auto: reduced ? 0 : 1, // 0..1 blend of the idle spin
    dragging: false,
    focus: null as null | { phi: number; theta: number },
    vfPhi: 0, // spring velocities
    vfTheta: 0,
    holdUntil: 0,
    dirty: true,
    visible: false,
    size: Math.max(200, host.clientWidth),
  };

  let globe: Globe | null = null;
  let raf = 0;
  let last = 0;
  let destroyed = false;
  let loading = false;
  let active = initialActive;

  // globe radius on screen: cobe draws a 0.8 disc in the ±1 clip box, times `scale`
  const radiusPx = () => 0.4 * SCALE * s.size;

  const settled = () =>
    !s.dragging && !s.focus && Math.abs(s.vPhi) < 1e-4 && Math.abs(s.vTheta) < 1e-4 && s.auto < 1e-3 && reduced;

  /** exact step of a critically damped spring: x'' = -2ω x' - ω² x, returns [offset, velocity] */
  const spring = (d: number, v: number, dt: number): [number, number] => {
    const e = Math.exp(-FOCUS_OMEGA * dt);
    const b = v + FOCUS_OMEGA * d;
    return [(d + b * dt) * e, (v - FOCUS_OMEGA * b * dt) * e];
  };

  const step = (now: number, dt: number) => {
    if (s.dragging) return;
    if (s.focus) {
      const dPhi = wrapPi(s.phi - s.focus.phi); // shortest signed offset to the target
      const [nd, nv] = spring(dPhi, s.vfPhi, dt);
      const [ndt, nvt] = spring(s.theta - s.focus.theta, s.vfTheta, dt);
      s.phi = s.focus.phi + nd;
      s.theta = s.focus.theta + ndt;
      s.vfPhi = nv;
      s.vfTheta = nvt;
      if (Math.abs(nd) < 4e-4 && Math.abs(ndt) < 4e-4 && Math.abs(nv) < 4e-3 && Math.abs(nvt) < 4e-3) {
        s.phi = s.focus.phi + nd;
        s.focus = null;
        s.vfPhi = s.vfTheta = 0;
        s.holdUntil = now + HOLD_MS;
      }
      s.auto = 0;
      return;
    }
    // inertia + idle spin
    const holding = now < s.holdUntil;
    const target = reduced || holding ? 0 : 1;
    s.auto += (target - s.auto) * (1 - Math.exp(-dt * 1.2));
    s.phi += (SPIN * s.auto + s.vPhi) * dt;
    s.theta = clamp(s.theta + s.vTheta * dt, THETA_MIN, THETA_MAX);
    const decay = Math.exp(-dt * 2.4);
    s.vPhi *= decay;
    s.vTheta *= decay;
    if (Math.abs(s.vPhi) < 1e-4) s.vPhi = 0;
    if (Math.abs(s.vTheta) < 1e-4) s.vTheta = 0;
    // idle tilt drifts back toward the resting view (slowly, only once the user has let go)
    if (!reduced && !holding) s.theta += (REST_THETA - s.theta) * (1 - Math.exp(-dt * 0.25));
    // keep phi bounded so float precision never degrades on a long session
    if (Math.abs(s.phi) > 1000) s.phi = wrapPi(s.phi);
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!globe) return;
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
    last = now;
    const p = s.phi;
    const t = s.theta;
    step(now, dt);
    if (s.dirty || s.phi !== p || s.theta !== t) {
      globe.update({ phi: s.phi, theta: s.theta });
      s.dirty = false;
    }
    if (settled()) halt();
  };
  const run = () => {
    if (!raf && globe && s.visible && !destroyed) {
      last = performance.now(); // no dt spike after being off-screen: phi simply continues from where it was
      raf = requestAnimationFrame(loop);
    }
  };
  function halt() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  const init = async () => {
    if (loading || globe) return;
    loading = true;
    const { default: createGlobe } = await import("cobe");
    if (destroyed) return;
    globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: s.size,
      height: s.size,
      phi: s.phi,
      theta: s.theta,
      dark: 1,
      diffuse: 1.1,
      scale: SCALE,
      mapSamples: coarse ? 9000 : 18000,
      mapBrightness: 6,
      baseColor: [0.94, 0.95, 0.94],
      markerColor: ORANGE,
      glowColor: [0.3, 0.31, 0.31],
      arcColor: ARC_DIM,
      arcWidth: 0.35,
      arcHeight: 0.14,
      markerElevation: 0.02,
      opacity: 1,
      markers: markersFor(nodes, active),
      arcs: arcsFor(nodes, active),
    });
    run();
  };

  const io = new IntersectionObserver(
    ([e]) => {
      s.visible = e.isIntersecting;
      if (s.visible) {
        void init();
        run();
      } else halt();
    },
    { rootMargin: "120px 0px" },
  );
  io.observe(host);

  const onVisibility = () => {
    if (document.hidden) halt();
    else run();
  };
  document.addEventListener("visibilitychange", onVisibility);

  const ro = new ResizeObserver(() => {
    const w = Math.round(host.clientWidth);
    if (w < 8 || w === s.size) return;
    s.size = w;
    globe?.update({ width: w, height: w });
    s.dirty = true;
    run();
  });
  ro.observe(host);

  // ── drag with inertia ──
  let lx = 0;
  let ly = 0;
  const samples: Array<{ t: number; phi: number; theta: number }> = [];
  const down = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    s.dragging = true;
    s.focus = null;
    s.vPhi = s.vTheta = s.vfPhi = s.vfTheta = 0;
    s.auto = 0;
    lx = e.clientX;
    ly = e.clientY;
    samples.length = 0;
    samples.push({ t: e.timeStamp, phi: s.phi, theta: s.theta });
    canvas.setPointerCapture(e.pointerId);
    run();
  };
  const move = (e: PointerEvent) => {
    if (!s.dragging) return;
    const r = radiusPx();
    s.phi += (e.clientX - lx) / r;
    s.theta = clamp(s.theta + (e.clientY - ly) / r, THETA_MIN, THETA_MAX);
    lx = e.clientX;
    ly = e.clientY;
    samples.push({ t: e.timeStamp, phi: s.phi, theta: s.theta });
    while (samples.length > 2 && e.timeStamp - samples[0].t > 100) samples.shift();
    s.dirty = true;
    run();
  };
  const up = (e: PointerEvent) => {
    if (!s.dragging) return;
    s.dragging = false;
    const a = samples[0];
    const age = e.timeStamp - (samples[samples.length - 1]?.t ?? e.timeStamp);
    const span = (samples[samples.length - 1]?.t ?? 0) - (a?.t ?? 0);
    if (a && span > 8 && age < 80 && !reduced) {
      const b = samples[samples.length - 1];
      s.vPhi = clamp(((b.phi - a.phi) / span) * 1000, -5, 5);
      s.vTheta = clamp(((b.theta - a.theta) / span) * 1000, -2.5, 2.5);
    } else {
      s.vPhi = s.vTheta = 0; // held still before release: no fling
    }
    s.holdUntil = performance.now() + HOLD_MS;
    s.auto = 0;
    run();
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  return {
    focus: (id) => {
      const t = nodes.find((x) => x.id === id);
      if (!t || s.dragging) return;
      if (!s.focus) {
        // carry the current angular velocity into the spring so the glide starts without a jolt
        s.vfPhi = s.vPhi + SPIN * s.auto;
        s.vfTheta = s.vTheta;
      }
      s.focus = focusAngles(t.lat, t.lon);
      s.auto = 0;
      if (reduced) {
        s.phi = s.focus.phi;
        s.theta = s.focus.theta;
        s.focus = null;
        s.dirty = true;
      }
      s.vPhi = s.vTheta = 0;
      run();
    },
    setActive: (id) => {
      active = id;
      if (!globe) return;
      globe.update({ markers: markersFor(nodes, id), arcs: arcsFor(nodes, id) });
      s.dirty = true;
      run();
    },
    get state() {
      return { phi: s.phi, theta: s.theta };
    },
    destroy: () => {
      destroyed = true;
      halt();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      globe?.destroy();
      globe = null;
      (canvas.getContext("webgl2") ?? canvas.getContext("webgl"))?.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
