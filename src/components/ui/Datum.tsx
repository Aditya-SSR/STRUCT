import type { ReactNode } from "react";

/** A registration cross "+" — the STRUCT datum. Inherits currentColor. */
export function Datum({ size = 11, className = "", signal }: { size?: number; className?: string; signal?: boolean }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 11 11"
      className={className}
      style={{ color: signal ? "var(--signal)" : undefined, flex: "none" }}
    >
      <path d="M5.5 0v11M0 5.5h11" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

/** Four corner brackets around its children (⌜ ⌝ ⌞ ⌟). The wrapper is `relative`. */
export function Corners({
  children,
  className = "",
  size = 10,
  inset = 0,
}: {
  children?: ReactNode;
  className?: string;
  size?: number;
  inset?: number;
}) {
  const b = "absolute border-current pointer-events-none";
  const s = { width: size, height: size } as const;
  return (
    <div className={`relative ${className}`}>
      {children}
      <span aria-hidden className={`${b} border-t border-l`} style={{ ...s, top: inset, left: inset }} />
      <span aria-hidden className={`${b} border-t border-r`} style={{ ...s, top: inset, right: inset }} />
      <span aria-hidden className={`${b} border-b border-l`} style={{ ...s, bottom: inset, left: inset }} />
      <span aria-hidden className={`${b} border-b border-r`} style={{ ...s, bottom: inset, right: inset }} />
    </div>
  );
}

/** Figure label, e.g. [ FIG. 03 — LOAD LINE ] */
export function Fig({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`t-label inline-flex items-center gap-2 ${className}`}>[ {children} ]</span>;
}
