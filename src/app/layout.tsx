import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/system/SmoothScroll";
import Cursor from "@/components/system/Cursor";
import Preloader from "@/components/system/Preloader";
import Header from "@/components/system/Header";
import Menu from "@/components/system/Menu";
import PageTransition from "@/components/system/PageTransition";
import Footer from "@/components/system/Footer";
import CartDrawer from "@/components/shop/CartDrawer";
import MobileNotice from "@/components/system/MobileNotice";

/*
 * STACKING ORDER (z-index) — highest first. Keep new layers inside this scale.
 *   110  Cursor            (mix-blend-difference, always on top)
 *   120  Skip link         (only while keyboard-focused)
 *   100  Preloader         (ASSEMBLY, split panel)
 *    90  PageTransition    (5 ink strips: covers header, menu and cart)
 *    80  CartDrawer        (shop agent; above header and menu)
 *    75  MobileNotice      (phones only: "better on a larger screen" bottom notice)
 *    70  Header            (fixed, mix-blend-difference; stays above the menu so MENU/CLOSE is always reachable)
 *    60  Menu              (full-page drop-down panel)
 *  <60   page content (sections may use 0–50)
 * Scroll locking goes through lockScroll()/unlockScroll() in @/lib/lenis (preloader, menu, cart share it).
 */

const monument = localFont({
  src: "./fonts/MonumentExtended-Regular.woff2",
  variable: "--font-monument",
  display: "swap",
});
const bitcount = localFont({
  src: "./fonts/BitcountPropSingle.woff2",
  variable: "--font-bitcount",
  display: "swap",
});
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "STRUCT — Form follows function", template: "%s — STRUCT" },
  description:
    "STRUCT is a Tokyo clothing studio that builds garments like structures. DROP-01: eight garments, 800 units. SUIT-01: one structure for the whole body, sold whole. A fictional brand — a design project.",
};
export const viewport: Viewport = { themeColor: "#0a0a0a", width: "device-width", initialScale: 1 };

/* Runs before first paint: decides how the preloader will behave so a skipped intro never flashes ink. */
const INTRO_SCRIPT = `(function(){try{var d=document.documentElement,r=window.matchMedia("(prefers-reduced-motion: reduce)").matches,s=false;try{s=sessionStorage.getItem("struct:intro")==="1"}catch(e){}d.setAttribute("data-intro",r?"skip":s?"quick":"full")}catch(e){}})();`;

const GLOBAL_CSS = `
@layer theme, base, components, utilities;
html[data-intro="skip"] #preloader{display:none!important}
/* native scrollbar hidden: Lenis drives scrolling, and locking scroll (preloader/menu/cart) must never shift the layout */
html{scrollbar-width:none}html::-webkit-scrollbar{display:none}
@layer base{:focus-visible{outline:2px solid var(--signal);outline-offset:3px}}
.skip-link{position:fixed;left:16px;top:12px;z-index:120;padding:12px 16px;background:var(--paper);color:var(--ink);font:12px/1 var(--font-space-mono),monospace;letter-spacing:.08em;text-transform:uppercase;transform:translateY(-200%)}
.skip-link:focus{transform:none}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${monument.variable} ${bitcount.variable} ${spaceMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
        <noscript>
          <style>{`#preloader{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll />
        <Cursor />
        <Preloader />
        <Header />
        <Menu />
        <CartDrawer />
        <PageTransition>
          <main id="main" tabIndex={-1} className="outline-none">{children}</main>
        </PageTransition>
        <Footer />
        <MobileNotice />
      </body>
    </html>
  );
}
