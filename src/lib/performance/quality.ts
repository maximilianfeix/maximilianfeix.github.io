import type { Quality } from "@/store/ui";

/**
 * A rough guess at what the device can render. It errs on the cautious side:
 * WebGL effects are a bonus, never required to use the site.
 */
export function detectQuality(): Quality {
  if (typeof window === "undefined") return "high";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) return "off";

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "low";
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (cores <= 4 || memory <= 4 || coarse) return "low";
  return "high";
}

/** Device pixel ratio cap per quality level – the biggest single lever on GPU cost. */
export const dprFor = (q: Quality): [number, number] => (q === "high" ? [1, 1.75] : [1, 1.25]);
