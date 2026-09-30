"use client";

import { useSyncExternalStore } from "react";

function subscribeTo(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
}

/** A media query as state. `serverValue` is what the static HTML renders with. */
export function useMedia(query: string, serverValue = false) {
  return useSyncExternalStore(
    subscribeTo(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
/** True on devices whose main pointer is a finger. */
export const useCoarsePointer = () => useMedia("(hover: none), (pointer: coarse)");
export const useIsMobile = () => useMedia("(max-width: 767px)");
