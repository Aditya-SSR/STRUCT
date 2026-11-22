import Image from "next/image";

/** Manifest-sourced studio image. Always `fill` inside an aspect-ratio / sized parent so there is no layout shift. */
export default function HomeImg({
  k,
  alt,
  sizes,
  className = "",
  priority,
  position,
}: {
  k: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** CSS object-position */
  position?: string;
}) {
  return (
    <Image
      src={`/img/${k}.webp`}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      draggable={false}
      className={`object-cover ${className}`}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}
