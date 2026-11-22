import { create } from "zustand";

/** Global UI state shared by the system layer and every page. */
type UI = {
  /** true once the preloader has finished (or was skipped). Hero reveals wait for this. */
  introDone: boolean;
  setIntroDone: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  /** true while a page transition cover is running */
  transitioning: boolean;
  setTransitioning: (v: boolean) => void;
  /** what is under the fixed header right now (sections set it via data-header-tone="dark|light") */
  headerTone: "light" | "dark";
  setHeaderTone: (t: "light" | "dark") => void;
};

export const useUI = create<UI>((set) => ({
  introDone: false,
  setIntroDone: (introDone) => set({ introDone }),
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  cartOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  transitioning: false,
  setTransitioning: (transitioning) => set({ transitioning }),
  headerTone: "light",
  setHeaderTone: (headerTone) => set({ headerTone }),
}));
