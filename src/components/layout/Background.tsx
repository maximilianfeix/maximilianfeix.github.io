"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useMedia";
import { lerp } from "@/lib/animation/config";

/**
 * The environment behind every page: a faint grid, two soft light sources and a vignette.
 * The light follows the pointer with a long delay, which gives the page depth without drawing attention.
 */
export function Background() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current!;
    let tx = 0.5,
      ty = 0.35,
      x = tx,
      y = ty,
      raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      x = lerp(x, tx, 0.04);
      y = lerp(y, ty, 0.04);
      el.style.setProperty("--lx", `${(x * 100).toFixed(2)}%`);
      el.style.setProperty("--ly", `${(y * 100).toFixed(2)}%`);
      el.style.setProperty("--gx", `${((x - 0.5) * -24).toFixed(2)}px`);
      el.style.setProperty("--gy", `${((y - 0.5) * -24).toFixed(2)}px`);
      raf = Math.abs(x - tx) + Math.abs(y - ty) > 0.0005 ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-900">
      <div
        className="absolute -inset-10 opacity-[0.35]"
        style={{
          transform: "translate3d(var(--gx, 0), var(--gy, 0), 0)",
          backgroundImage:
            "linear-gradient(to right, rgb(237 235 228 / 0.045) 1px, transparent 1px), linear-gradient(to bottom, rgb(237 235 228 / 0.045) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px circle at var(--lx, 50%) var(--ly, 35%), rgb(237 235 228 / 0.055), transparent 60%), radial-gradient(1200px circle at 85% 110%, rgb(198 243 107 / 0.035), transparent 60%)",
        }}
      />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgb(0 0 0 / 0.55) 100%)" }} />
    </div>
  );
}
