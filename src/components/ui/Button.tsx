"use client";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import TransitionLink from "./TransitionLink";

type Props = {
  children: ReactNode;
  href?: string;
  /** colour of the button's own ink: "ink" (default) for use on paper, "paper" for use on ink */
  tone?: "ink" | "paper";
  /** solid = filled with a wipe-to-outline hover; line = outlined with a wipe-to-fill hover */
  variant?: "solid" | "line";
  arrow?: boolean;
  className?: string;
  "data-cursor"?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

/**
 * STRUCT button: rectangular, 1px border, mono caps label, zero radius.
 * Hover = a fill wipes up from the bottom (CSS only, ease-resolve).
 */
export default function Button({ children, href, tone = "ink", variant = "line", arrow = true, className = "", ...rest }: Props) {
  const onInk = tone === "paper";
  const base = "group relative inline-flex items-center justify-between gap-6 overflow-hidden border px-5 py-3.5 t-label select-none";
  const colours =
    variant === "solid"
      ? onInk ? "bg-paper text-ink border-paper" : "bg-ink text-paper border-ink"
      : onInk ? "text-paper border-paper" : "text-ink border-ink";
  const wipe =
    variant === "solid"
      ? onInk ? "bg-ink" : "bg-paper"
      : onInk ? "bg-paper" : "bg-ink";
  const labelHover =
    variant === "solid"
      ? onInk ? "group-hover:text-paper" : "group-hover:text-ink"
      : onInk ? "group-hover:text-ink" : "group-hover:text-paper";

  const inner = (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 translate-y-full ${wipe} transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0`}
      />
      <span className={`relative z-10 transition-colors duration-500 ${labelHover}`}>{children}</span>
      {arrow && <span className={`relative z-10 transition-colors duration-500 ${labelHover}`} aria-hidden>→</span>}
    </>
  );
  const cls = `${base} ${colours} ${className}`;

  if (href) {
    return (
      <TransitionLink href={href} className={cls} data-cursor={rest["data-cursor"]}>
        {inner}
      </TransitionLink>
    );
  }
  return (
    <button {...rest} className={cls}>
      {inner}
    </button>
  );
}
