"use client";
import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { hasNavigator, navigateWithTransition } from "@/components/system/transitionBus";
import { scrollToTop } from "@/lib/lenis";

type Props = ComponentProps<typeof Link>;

function hrefToString(href: Props["href"]): string {
  if (typeof href === "string") return href;
  const { pathname = "", search = "", hash = "" } = href;
  const s = typeof search === "string" ? search : "";
  const h = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
  return `${pathname}${s && !s.startsWith("?") ? `?${s}` : s}${h}`;
}

/**
 * Internal link that runs the STRUCT page-transition cover (5 ink strips) before navigating.
 * Same props as next/link. ALWAYS use this (never next/link directly) for internal navigation.
 *
 * Falls through to normal Link behaviour for: modified clicks, new tabs, downloads, external URLs, hash-only
 * links, and whenever the transition layer isn't mounted. Same-page links just scroll to the top.
 */
export default function TransitionLink({ onClick, ...props }: Props) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (props.target && props.target !== "_self") return;
    if (props.download) return;
    if (!hasNavigator()) return;

    const raw = hrefToString(props.href);
    if (!raw || raw.startsWith("#")) return;

    let url: URL;
    try {
      url = new URL(raw, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;

    const here = window.location;
    if (url.pathname === here.pathname && url.search === here.search) {
      if (url.hash) return; // in-page anchor: let the browser / Lenis handle it
      e.preventDefault();
      scrollToTop();
      return;
    }

    e.preventDefault();
    navigateWithTransition(url.pathname + url.search + url.hash, { replace: !!props.replace });
  };

  return <Link {...props} onClick={handleClick} />;
}
