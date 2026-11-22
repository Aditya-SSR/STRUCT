"use client";

export type CutFilter = "all" | "men" | "women";
export type ColourFilter = "all" | "noir" | "blanc";

type Props = {
  cut: CutFilter;
  colour: ColourFilter;
  onCut: (v: CutFilter) => void;
  onColour: (v: ColourFilter) => void;
  shown: number;
  total: number;
};

const CUTS: CutFilter[] = ["all", "men", "women"];
const COLOURS: ColourFilter[] = ["all", "noir", "blanc"];

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      data-cursor="FILTER"
      className={`t-label border px-4 py-3 outline-offset-2 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal ${
        active ? "border-ink bg-ink text-paper" : "hairline text-ink hover:bg-bone"
      }`}
    >
      {label}
    </button>
  );
}

function Group<T extends string>({
  name,
  options,
  value,
  onPick,
}: {
  name: string;
  options: T[];
  value: T;
  onPick: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={name} className="flex items-center gap-3">
      <span className="t-label hidden text-smoke sm:inline" aria-hidden>
        {name}
      </span>
      <div className="flex">
        {options.map((o, i) => (
          <div key={o} className={i > 0 ? "-ml-px" : ""}>
            <Toggle label={o.toUpperCase()} active={value === o} onClick={() => onPick(o)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** ALL / MEN / WOMEN  ·  ALL / NOIR / BLANC  ·  `4 / 4 OBJECTS` */
export default function FilterBar({ cut, colour, onCut, onColour, shown, total }: Props) {
  return (
    <div className="flex flex-col gap-5 border-b hairline pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
        <Group name="CUT" options={CUTS} value={cut} onPick={onCut} />
        <Group name="COLOUR" options={COLOURS} value={colour} onPick={onColour} />
      </div>
      <p className="t-dots text-lg" role="status" aria-live="polite" aria-atomic="true">
        {shown} / {total} OBJECTS
      </p>
    </div>
  );
}
