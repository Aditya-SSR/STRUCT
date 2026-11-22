"use client";
import { Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { hasWebGL } from "./env";

/** Props every lazy scene module receives from the host. */
export type StageState = {
  /** on-screen and tab visible: render. Otherwise the frame loop is "never". */
  active: boolean;
  reduced: boolean;
  small: boolean;
  /** call once the first frame has been drawn (the host then fades the canvas in) */
  onReady: () => void;
};

type Props<P extends object> = {
  Scene: ComponentType<P & StageState> | LazyExoticComponent<ComponentType<P & StageState>>;
  sceneProps: P;
  /** replaces the default positioning ("absolute inset-0") */
  className?: string;
  fallback?: ReactNode;
};

/**
 * Light entry-chunk wrapper: detects WebGL / reduced motion / small screens, mounts the (lazy) scene only when the
 * host is near the viewport, and flips `active` so the frame loop pauses while off-screen or in a background tab.
 */
export default function StageHost<P extends object>({ Scene, sceneProps, className, fallback }: Props<P>) {
  const ref = useRef<HTMLDivElement>(null);
  const [caps, setCaps] = useState<{ webgl: boolean; reduced: boolean; small: boolean } | null>(null);
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sm = window.matchMedia("(max-width: 767px), (pointer: coarse) and (max-width: 1024px)");
    const read = () => setCaps({ webgl: hasWebGL(), reduced: rm.matches, small: sm.matches });
    read();
    rm.addEventListener("change", read);
    sm.addEventListener("change", read);
    return () => {
      rm.removeEventListener("change", read);
      sm.removeEventListener("change", read);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true);
      setOnScreen(true);
      return;
    }
    // wide margin: mount/unmount (bounds live WebGL contexts) · tight margin: render/pause
    const far = new IntersectionObserver(([e]) => {
      setNear(e.isIntersecting);
      if (!e.isIntersecting) setReady(false);
    }, { rootMargin: "120% 0px" });
    const tight = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "8% 0px" });
    far.observe(el);
    tight.observe(el);
    return () => {
      far.disconnect();
      tight.disconnect();
    };
  }, []);

  useEffect(() => {
    const on = () => setTabVisible(!document.hidden);
    on();
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  const live = !!caps?.webgl && near;
  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none overflow-hidden", className ?? "absolute inset-0")}>
      {caps && !caps.webgl ? fallback : null}
      {live ? (
        <div className="absolute inset-0" style={{ opacity: ready ? 1 : 0, transition: "opacity 900ms cubic-bezier(.76,0,.24,1)" }}>
          <Suspense fallback={null}>
            <Scene
              {...sceneProps}
              active={onScreen && tabVisible}
              reduced={caps.reduced}
              small={caps.small}
              onReady={() => setReady(true)}
            />
          </Suspense>
        </div>
      ) : null}
    </div>
  );
}
