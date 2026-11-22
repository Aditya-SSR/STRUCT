"use client";
import { useEffect, useRef, useState } from "react";
import type { Garment } from "@/data/drop";
import { useAddGarment } from "./useAddGarment";
import { isSoldOut } from "./drop-utils";

/**
 * Size chips that add to the bag in one click. Desktop: they slide up over the foot of the photograph on hover /
 * keyboard focus. Touch: a small + toggle opens the same panel. Lives in the card's frame, above the stretched link.
 */
export default function QuickAdd({ g }: { g: Garment }) {
  const add = useAddGarment();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const out = isSoldOut(g);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const pick = (size: string) => {
    const r = add(g, size);
    setNote(r === "limit" ? "MAX 2 PER SIZE" : "");
    setDone(r === "added" ? size : null);
    setOpen(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDone(null);
      setNote("");
    }, 2000);
  };

  if (out) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Quick add ${g.name}`}
        onClick={() => setOpen(true)}
        data-cursor="ADD"
        tabIndex={-1}
        className={`pointer-events-auto absolute bottom-2 right-2 hidden h-9 w-9 items-center justify-center bg-ink text-paper transition-opacity duration-300 [@media(hover:none)]:flex ${
          open ? "opacity-0" : "opacity-100"
        }`}
      >
        <span aria-hidden className="relative block h-[11px] w-[11px]">
          <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
          <span className="absolute left-1/2 top-0 h-full w-px bg-current" />
        </span>
      </button>

      <div
        data-open={open}
        role="group"
        aria-label={`Quick add ${g.name}`}
        className="pointer-events-auto absolute inset-x-0 bottom-0 translate-y-full border-t hairline bg-paper px-2 pb-2 pt-2 text-ink transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] data-[open=true]:translate-y-0 group-hover/card:translate-y-0 group-has-[:focus-visible]/card:translate-y-0 md:px-3 md:pb-3"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="t-label" aria-live="polite">
            {done ? `ADDED — ${done}` : note || "QUICK ADD"}
          </span>
          <button
            type="button"
            aria-label="Close quick add"
            onClick={() => setOpen(false)}
            tabIndex={-1}
            className="t-label hidden px-1 [@media(hover:none)]:inline"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-4 border hairline">
          {g.sizes.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => pick(s)}
              data-cursor="ADD"
              aria-label={`Add ${g.name} size ${s} to bag`}
              className={`t-dots py-2.5 text-base outline-offset-[-3px] transition-colors duration-300 hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal md:py-2 ${
                i > 0 ? "border-l hairline" : ""
              } ${done === s ? "bg-ink text-paper" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
