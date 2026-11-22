"use client";
import { useRef, type KeyboardEvent } from "react";

type Props = {
  sizes: string[];
  value: string | null;
  onChange: (s: string) => void;
  /** flips true when ADD TO BAG was pressed without a size */
  invalid?: boolean;
  id?: string;
};

/** XS–XL as an ARIA radio group: one tab stop, arrow keys move + select. */
export default function SizeSelect({ sizes, value, onChange, invalid, id = "size-select" }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + sizes.length) % sizes.length;
    refs.current[next]?.focus();
    onChange(sizes[next]);
  };

  return (
    <div id={id} className="scroll-mt-40">
      <div className="mb-3 flex items-center justify-between">
        <span id={`${id}-label`} className="t-label">
          SIZE
        </span>
        <span className="t-label text-smoke">{value ? `SELECTED — ${value}` : "XS – XL"}</span>
      </div>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-required="true"
        aria-invalid={invalid || undefined}
        className={`grid grid-cols-5 border outline-offset-4 ${invalid ? "outline outline-2 outline-signal" : ""} hairline`}
      >
        {sizes.map((s, i) => {
          const on = value === s;
          return (
            <button
              key={s}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`Size ${s}`}
              tabIndex={on || (!value && i === 0) ? 0 : -1}
              onClick={() => onChange(s)}
              onKeyDown={(e) => onKey(e, i)}
              data-cursor="SIZE"
              className={`t-dots py-4 text-lg outline-offset-[-3px] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${
                i > 0 ? "border-l hairline" : ""
              } ${on ? "bg-ink text-paper" : "hover:bg-bone"}`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
