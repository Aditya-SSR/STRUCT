"use client";
import type { ReactNode } from "react";

export type LayerFilter = "all" | "outer" | "mid" | "base";
export type SortKey = "default" | "asc" | "desc";

const LAYERS: LayerFilter[] = ["all", "outer", "mid", "base"];
const SORTS: { key: SortKey; label: string }[] = [
  { key: "default", label: "DEFAULT" },
  { key: "asc", label: "PRICE ↑" },
  { key: "desc", label: "PRICE ↓" },
];

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      data-cursor="FILTER"
      className={`t-label whitespace-nowrap border px-3 py-3 outline-offset-2 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal sm:px-4 ${
        active ? "border-ink bg-ink text-paper" : "hairline text-ink hover:bg-bone"
      }`}
    >
      {label}
    </button>
  );
}

function Group({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={name} className="flex items-center gap-3">
      <span className="t-label hidden text-smoke sm:inline" aria-hidden>
        {name}
      </span>
      <div className="flex [&>*+*]:-ml-px">{children}</div>
    </div>
  );
}

type Props = {
  layer: LayerFilter;
  sort: SortKey;
  onLayer: (v: LayerFilter) => void;
  onSort: (v: SortKey) => void;
  shown: number;
  total: number;
};

/** ALL / OUTER / MID / BASE  ·  DEFAULT / PRICE ↑ / PRICE ↓  ·  `8 / 8 GARMENTS` */
export default function FilterBar({ layer, sort, onLayer, onSort, shown, total }: Props) {
  return (
    <div className="flex flex-col gap-5 border-b hairline pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
        <Group name="LAYER">
          {LAYERS.map((l) => (
            <Toggle key={l} label={l.toUpperCase()} active={layer === l} onClick={() => onLayer(l)} />
          ))}
        </Group>
        <Group name="SORT">
          {SORTS.map((s) => (
            <Toggle key={s.key} label={s.label} active={sort === s.key} onClick={() => onSort(s.key)} />
          ))}
        </Group>
      </div>
      <p className="t-dots text-lg" role="status" aria-live="polite" aria-atomic="true">
        {shown} / {total} GARMENTS
      </p>
    </div>
  );
}
