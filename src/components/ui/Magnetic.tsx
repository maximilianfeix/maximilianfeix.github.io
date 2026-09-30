"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useCoarsePointer, useReducedMotion } from "@/hooks/useMedia";
import { duration, ease } from "@/lib/animation/config";

/**
 * Pulls its child toward the pointer once the pointer comes within `radius` px of its centre,
 * and lets it spring back when the pointer leaves.
 */
export function Magnetic({
  children,
  strength = 0.35,
  radius = 120,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (coarse || reduced) return;
    const el = ref.current!;
    const xTo = gsap.quickTo(el, "x", { duration: duration.base, ease: ease.out });
    const yTo = gsap.quickTo(el, "y", { duration: duration.base, ease: ease.out });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const reach = radius + Math.max(r.width, r.height) / 2;
      if (Math.hypot(dx, dy) < reach) {
        xTo(dx * strength);
        yTo(dy * strength);
      } else {
        xTo(0);
        yTo(0);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf(el);
    };
  }, [coarse, reduced, strength, radius]);

  return (
    <div ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </div>
  );
}
