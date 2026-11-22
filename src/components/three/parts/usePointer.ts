"use client";
import { useEffect } from "react";

/** Shared, mutable viewport-normalised pointer (-1..1, y up). One window listener for every scene. */
export const pointer = { x: 0, y: 0 };
let users = 0;

function onMove(e: PointerEvent) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
}

export function usePointer() {
  useEffect(() => {
    if (users++ === 0) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (--users === 0) window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return pointer;
}
