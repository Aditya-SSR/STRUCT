/** Client-only capability helpers shared by every scene host (no three.js import — stays in the entry chunk). */
let webglCache: boolean | undefined;

export function hasWebGL(): boolean {
  if (webglCache !== undefined) return webglCache;
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | WebGL2RenderingContext | null;
    webglCache = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglCache = false;
  }
  return webglCache;
}
