"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/hooks/useMedia";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
/** The running Lenis instance, for code that needs to scroll programmatically. */
export const getLenis = () => lenis;

/**
 * Lenis drives the scroll position, GSAP's ticker drives Lenis – one requestAnimationFrame loop for everything,
 * so ScrollTrigger and the smooth scroll never disagree about where the page is.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) return;
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, anchors: { offset: 0 } });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, [reduced]);

  // A new route starts at the top (or at its hash), and every trigger measures the new layout.
  // After a client-side navigation, keyboard and screen-reader focus moves to the new content.
  const firstRoute = useRef(true);
  useEffect(() => {
    const hash = window.location.hash;
    const target = hash ? document.querySelector<HTMLElement>(hash) : null;
    if (target) lenis?.scrollTo(target, { immediate: true });
    else if (!hash) lenis?.scrollTo(0, { immediate: true });
    if (!firstRoute.current) (target ?? document.getElementById("main"))?.focus({ preventScroll: true });
    firstRoute.current = false;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Stop all per-frame work while the tab is hidden.
  useEffect(() => {
    const onVisibility = () => (document.hidden ? gsap.ticker.sleep() : gsap.ticker.wake());
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return null;
}
