import { Datum } from "@/components/ui/Datum";
import { BRAND } from "@/data/brand";
import { Clock } from "./Clock";

/**
 * The static markup of the ASSEMBLY preloader. It is rendered TWICE (top half / bottom half of the panel)
 * so the finished panel can split along the middle of the word. All animation is done by Preloader.tsx
 * through the `.pl-*` hooks below. Everything that animates starts at opacity 0 (set in markup) so nothing
 * flashes before hydration.
 */
const WORD = "STRUCT".split("");
const hidden = { opacity: 0 } as const;

export default function PreloaderScene() {
  return (
    <div
      className="absolute inset-0 text-paper"
      style={{
        // frame inset + inner padding, shared by the word-fit maths
        ["--fi" as string]: "clamp(12px, 1.6vw, 24px)",
        ["--pl-pad" as string]: "calc(var(--fi) + clamp(12px, 1.4vw, 22px))",
        backgroundImage: "radial-gradient(rgb(243 244 242 / 0.07) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* hairline frame (load lines) */}
      <span data-o="h" className="pl-line absolute h-px bg-paper/45" style={{ ...hidden, left: "var(--fi)", right: "var(--fi)", top: "var(--fi)" }} />
      <span data-o="h" className="pl-line absolute h-px bg-paper/45" style={{ ...hidden, left: "var(--fi)", right: "var(--fi)", bottom: "var(--fi)" }} />
      <span data-o="v" className="pl-line absolute w-px bg-paper/45" style={{ ...hidden, top: "var(--fi)", bottom: "var(--fi)", left: "var(--fi)" }} />
      <span data-o="v" className="pl-line absolute w-px bg-paper/45" style={{ ...hidden, top: "var(--fi)", bottom: "var(--fi)", right: "var(--fi)" }} />
      {/* datum crosses on the corners */}
      {[
        { left: "var(--fi)", top: "var(--fi)" },
        { right: "var(--fi)", top: "var(--fi)" },
        { left: "var(--fi)", bottom: "var(--fi)" },
        { right: "var(--fi)", bottom: "var(--fi)" },
      ].map((pos, i) => (
        <span
          key={i}
          className="pl-corner absolute -m-[7px]"
          style={{ ...hidden, ...pos, margin: pos.left ? "-6px 0 0 -6px" : "-6px -6px 0 0" }}
        >
          <Datum size={13} />
        </span>
      ))}

      <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: "calc(var(--pl-pad) + 6px) var(--pl-pad)" }}>
        {/* top metadata */}
        <div className="flex items-start justify-between gap-6">
          <span className="pl-meta t-label block text-[0.625rem] md:text-[0.6875rem]" style={hidden}>
            TOKYO {BRAND.coords}
          </span>
          <span className="pl-meta t-dots block text-[0.9375rem] md:text-lg" style={hidden}>
            <Clock /> JST
          </span>
        </div>

        {/* the word */}
        <div
          className="flex justify-center whitespace-nowrap font-display uppercase leading-none"
          style={{ fontSize: "calc((100cqw - 2 * var(--pl-pad)) / 5.42)" }}
        >
          {WORD.map((ch, i) => (
            <span key={i} className="relative inline-block" style={{ marginRight: i < WORD.length - 1 ? "-0.04em" : 0 }}>
              <span className="inline-block overflow-hidden align-top" style={{ lineHeight: 0.8, padding: "0.06em 0" }}>
                <span className="pl-letter inline-block" style={hidden}>
                  {ch}
                </span>
              </span>
              <span className="pl-flash absolute left-0 top-0 text-signal" style={{ ...hidden, margin: "-0.02em 0 0 -0.02em" }}>
                <Datum size={13} signal />
              </span>
            </span>
          ))}
        </div>

        {/* bottom: counter + status */}
        <div className="flex items-end justify-between gap-6">
          <div className="flex items-end gap-3 md:gap-5">
            <div className="t-dots flex text-[clamp(5rem,22cqw,24rem)]" style={{ lineHeight: 0.78 }}>
              {[0, 1, 2].map((d) => (
                <span key={d} className={`pl-d pl-d${d} inline-block w-[0.7em] text-center`} style={hidden}>
                  0
                </span>
              ))}
            </div>
            <span className="pl-meta t-label mb-[0.4em] hidden text-[0.625rem] md:block" style={hidden}>
              <span className="block text-paper/60">KOZO</span>
              <span className="pl-phase block">01 LOAD</span>
            </span>
          </div>
          <div className="pl-meta text-right" style={hidden}>
            <span className="t-label block text-[0.625rem] text-paper/60 md:text-[0.6875rem]">SYS.STATUS: ASSEMBLING</span>
            <span className="t-dots mt-1 block text-[0.9375rem] md:text-lg">EST. {BRAND.founded}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
