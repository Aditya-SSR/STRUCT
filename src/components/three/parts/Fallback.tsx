/** Static hairline stand-in used when WebGL is unavailable. Inherits currentColor. */
export default function Fallback({ kind = "blocks" }: { kind?: "blocks" | "loop" | "dots" }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 m-auto h-full w-full max-h-[80%] max-w-[90%] opacity-30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
    >
      {kind === "blocks" && (
        <g>
          <path d="M60 250h280M80 250V110h60v140M140 250V170h90v80M170 170v-50h50v50M240 250V190h70v60" />
          <path d="M20 250H0M400 250h-60" />
        </g>
      )}
      {kind === "loop" && (
        <g>
          <ellipse cx="200" cy="150" rx="140" ry="62" />
          <path d="M60 150c60-70 220 70 280 0" />
        </g>
      )}
      {kind === "dots" && (
        <g strokeDasharray="1 11">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M40 ${70 + i * 20}h320`} />
          ))}
        </g>
      )}
    </svg>
  );
}
