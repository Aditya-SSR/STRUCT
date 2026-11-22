/**
 * Tiny module-level bus between TransitionLink / Menu (callers) and PageTransition (the owner of the cover).
 * If no navigator is registered, callers fall back to a plain next/link navigation.
 */
export type NavOpts = { replace?: boolean };
type Navigator = (href: string, opts?: NavOpts) => void;

let navigator: Navigator | null = null;

export function registerNavigator(fn: Navigator) {
  navigator = fn;
  return () => {
    if (navigator === fn) navigator = null;
  };
}

export const hasNavigator = () => navigator !== null;
export const navigateWithTransition = (href: string, opts?: NavOpts) => navigator?.(href, opts);
