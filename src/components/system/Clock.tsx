"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Live clocks without hydration mismatch: the server snapshot is "" and the client snapshot is the formatted time,
 * so markup only changes after hydration. One shared 1s interval drives every subscriber.
 */
const subs = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void) {
  subs.add(cb);
  if (!timer) timer = setInterval(() => subs.forEach((s) => s()), 1000);
  return () => {
    subs.delete(cb);
    if (!subs.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function fmt(tz: string, seconds: boolean) {
  const key = tz + (seconds ? "s" : "m");
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      ...(seconds ? { second: "2-digit" } : {}),
      hourCycle: "h23",
    });
    formatters.set(key, f);
  }
  return f;
}

/** "14:32:07" (or "14:32") in the given IANA timezone. "" until mounted. */
export function useClock(tz = "Asia/Tokyo", seconds = true): string {
  return useSyncExternalStore(
    subscribe,
    () => fmt(tz, seconds).format(new Date()),
    () => "",
  );
}

/**
 * Small component form: <Clock prefix="TYO " />
 * Renders ONCE; the shared 1s interval writes the time straight into a text node (no React re-render per tick).
 */
export function Clock({
  tz = "Asia/Tokyo",
  prefix = "",
  seconds = true,
  placeholder,
  className,
}: {
  tz?: string;
  prefix?: string;
  seconds?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const f = fmt(tz, seconds);
    const write = () => {
      const t = `${prefix}${f.format(new Date())}`;
      if (node.textContent !== t) node.textContent = t;
    };
    write();
    return subscribe(write);
  }, [tz, seconds, prefix]);
  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {prefix}
      {placeholder || (seconds ? "--:--:--" : "--:--")}
    </span>
  );
}
