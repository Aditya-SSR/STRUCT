"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import Button from "@/components/ui/Button";
import SplitReveal from "@/components/ui/SplitReveal";
import { useUI } from "@/store/ui";

const KEY = "struct:mobile-note";
const QUERY = "(max-width: 767px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getSmall = () => window.matchMedia(QUERY).matches;
const getSmallServer = () => false;

// "dismissed" lives in sessionStorage; read through useSyncExternalStore so it is hydration-safe and never flashes
// (the server snapshot says "dismissed", so nothing renders until the client has read the real value).
const EVENT = "struct:mobile-note";
let dismissedInMemory = false; // fallback when sessionStorage is unavailable (private mode)
const subscribeDismissed = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};
const getDismissed = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return dismissedInMemory;
  }
};
const getDismissedServer = () => true;

/**
 * Phones only: a small bottom notice that STRUCT is built as a desktop experience and is better on a larger screen.
 * Appears after the intro, can be dismissed ("continue anyway"), and offers a one-tap "copy link" so it can be opened
 * on a laptop. Remembered for the session. Never rendered on tablets/desktops.
 */
export default function MobileNotice() {
  const small = useSyncExternalStore(subscribe, getSmall, getSmallServer);
  const introDone = useUI((s) => s.introDone);
  const dismissed = useSyncExternalStore(subscribeDismissed, getDismissed, getDismissedServer);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const show = small && introDone && !dismissed;

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !show || prefersReducedMotion()) return;
      gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: "expo.out", delay: 0.4 });
    },
    { dependencies: [show] },
  );

  const finish = () => {
    dismissedInMemory = true;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* private mode: the in-memory flag still closes it for this visit */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  const dismiss = () => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return finish();
    gsap.to(el, { yPercent: 100, duration: 0.6, ease: "power4.inOut", onComplete: finish });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      /* clipboard unavailable: the notice still explains what to do */
    }
  };

  if (!show) return null;
  return (
    <div
      ref={root}
      role="region"
      aria-label="Screen size notice"
      className="tone-noir pad-x fixed inset-x-0 bottom-0 z-[75] border-t hairline pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <p className="t-label text-paper/60">[ BEST ON A LARGER SCREEN ]</p>
      <SplitReveal as="p" className="t-h3 mt-3" when="mount" delay={0.9} head={false}>
        Open it on a laptop.
      </SplitReveal>
      <p className="t-body mt-3 text-paper/75">
        STRUCT is built as a desktop experience, with pinned scenes, 3D and a lot of motion. It works on your phone, but it is
        better on a larger screen.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button tone="paper" variant="solid" arrow={false} onClick={copy}>
          {copied ? "COPIED" : "COPY LINK"}
        </Button>
        <Button tone="paper" variant="line" arrow={false} onClick={dismiss}>
          CONTINUE
        </Button>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
