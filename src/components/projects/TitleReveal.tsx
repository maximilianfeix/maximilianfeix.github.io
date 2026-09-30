"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "@/components/motion/SplitText";
import { duration, ease, stagger } from "@/lib/animation/config";

/** A heading whose letters rise out of a mask once, when the page arrives. */
export function TitleReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = ref.current!.querySelectorAll("[data-char]");
    const tween = gsap.fromTo(
      chars,
      { yPercent: 105 },
      { yPercent: 0, duration: duration.cinematic, ease: ease.out, stagger: stagger.letters, delay: 0.25 },
    );
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div ref={ref} className="[&_.split-word]:[clip-path:inset(-10%_-2%_-12%_-2%)]">
      <SplitText as="h1" text={text} className={className} />
    </div>
  );
}
