"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { duration, ease, stagger } from "@/lib/animation/config";

/**
 * Reveals every [data-reveal] inside once, as it scrolls into view. Elements start hidden only after
 * JavaScript has run, so the content is always there without it. [data-reveal="line"] draws a rule instead.
 */
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]:not([data-reveal=line])");
      const lines = gsap.utils.toArray<HTMLElement>("[data-reveal=line]");
      if (items.length) gsap.set(items, { autoAlpha: 0, y: 28 });
      if (lines.length) gsap.set(lines, { scaleX: 0, transformOrigin: "left center" });
      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: duration.slow, ease: ease.out, stagger: stagger.items }),
      });
      lines.forEach((line) =>
        gsap.to(line, { scaleX: 1, duration: duration.cinematic, ease: ease.inOut, scrollTrigger: { trigger: line, start: "top 90%", once: true } }),
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    // @ts-expect-error – the ref type follows the chosen tag
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
