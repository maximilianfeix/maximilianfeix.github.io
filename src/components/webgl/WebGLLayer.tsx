"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useUI } from "@/store/ui";
import { detectQuality } from "@/lib/performance/quality";
import { useCoarsePointer, useReducedMotion } from "@/hooks/useMedia";

// Three.js stays out of the first bundle; it loads once the browser is idle.
const Particles = dynamic(() => import("./Particles"), { ssr: false });
const DistortLayer = dynamic(() => import("./DistortLayer"), { ssr: false });

export function WebGLLayer() {
  const quality = useUI((s) => s.quality);
  const setQuality = useUI((s) => s.setQuality);
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();

  useEffect(() => {
    const run = () => setQuality(detectQuality());
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(run, 300);
    return () => clearTimeout(id);
  }, [setQuality, reduced]);

  if (reduced || quality === "off") return null;
  return (
    <>
      <Particles quality={quality} />
      {quality === "high" && !coarse && <DistortLayer />}
    </>
  );
}
