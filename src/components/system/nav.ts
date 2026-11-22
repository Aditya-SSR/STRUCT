/** Single source for primary navigation + transition labels. */
export const NAV = [
  { n: "01", label: "INDEX", href: "/", path: "/" },
  { n: "02", label: "DROP-01", href: "/drop-01", path: "/drop-01" },
  { n: "03", label: "SUIT-01", href: "/suit-01", path: "/suit-01" },
  { n: "04", label: "PEOPLE", href: "/people", path: "/people" },
] as const;

export const CONTACT = "studio@struct.example";

/** "02 / DROP-01" style label for the page-transition cover. */
export function labelFor(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const hit = NAV.find((i) => (i.path === "/" ? clean === "/" : clean === i.path || clean.startsWith(i.path + "/")));
  if (hit) return `${hit.n} / ${hit.label}`;
  return `-- / ${clean.split("/").filter(Boolean)[0]?.toUpperCase() ?? "INDEX"}`;
}

/** Is `href` the active nav entry for `pathname`? */
export function isActive(pathname: string, path: string) {
  return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");
}
