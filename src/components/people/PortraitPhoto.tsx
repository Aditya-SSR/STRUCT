import Image from "next/image";
import { cropRect } from "./crops";

/**
 * The real photograph, cropped to the person's head-and-shoulders, positioned with pure CSS percentages
 * so it follows its container at any size (no JS, no resize work). Parent must be `relative overflow-hidden`
 * with aspect-ratio 4 / 5.
 */
export default function PortraitPhoto({ image, alt, className = "" }: { image: string; alt: string; className?: string }) {
  const r = cropRect(image);
  return (
    <Image
      unoptimized
      src={`/img/${image}.webp`}
      width={r.srcW}
      height={r.srcH}
      alt={alt}
      draggable={false}
      decoding="async"
      sizes="400px"
      className={`pointer-events-none absolute max-w-none select-none ${className}`}
      style={{
        maxWidth: "none", // beats the global `img { max-width: 100% }`
        width: `${(r.srcW / r.w) * 100}%`,
        height: "auto",
        left: `${-(r.x / r.w) * 100}%`,
        top: `${-(r.y / r.h) * 100}%`,
      }}
    />
  );
}
