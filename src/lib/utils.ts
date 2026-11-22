export const cn = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const pad = (n: number, len = 2) => String(n).padStart(len, "0");
export const fmtUSD = (n: number) => "$" + n.toLocaleString("en-US");
export const fmtJPY = (n: number) => "¥" + n.toLocaleString("ja-JP");
