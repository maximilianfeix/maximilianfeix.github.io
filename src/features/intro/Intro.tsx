"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useUI } from "@/store/ui";
import { duration, ease } from "@/lib/animation/config";
import { getLenis } from "@/features/scroll/SmoothScroll";

const KEY = "maxi:intro-seen";
const steps = ["INITIALIZING PROJECT GRAPH", "LOADING INTERACTIONS", "ESTABLISHING CONNECTION", "READY"];

function seenBefore() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * A short boot sequence (~1.8 s), once per session. Any key, click or tap skips it.
 * Without JavaScript the overlay removes itself with a CSS animation, so the page is never stuck behind it.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const setIntroDone = useUI((s) => s.setIntroDone);

  useEffect(() => {
    const finish = () => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      getLenis()?.start();
      setIntroDone();
      setGone(true);
    };

    if (seenBefore() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    getLenis()?.stop();
    const el = root.current!;
    const lines = el.querySelectorAll<HTMLElement>("[data-step]");
    const bar = el.querySelector<HTMLElement>("[data-bar]");
    const tl = gsap.timeline({ onComplete: finish });
    tl.set(el, { animation: "none" })
      .from(el.querySelectorAll("[data-head]"), { opacity: 0, y: 6, duration: 0.3, stagger: 0.08, ease: ease.soft })
      .to(bar, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.2);
    lines.forEach((line, i) => {
      tl.fromTo(line, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.3 + i * 0.26);
      tl.fromTo(line.querySelector("[data-ok]"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.45 + i * 0.26);
    });
    tl.to(el.querySelector("[data-content]"), { opacity: 0, y: -10, duration: duration.fast, ease: ease.exit }, "+=0.12")
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: duration.slow, ease: ease.inOut })
      .call(() => useUI.getState().setIntroDone(), [], "-=0.7");

    const skip = () => tl.progress(1);
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      tl.kill();
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [setIntroDone]);

  if (gone) return null;

  return (
    <div
      ref={root}
      data-intro
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[80] flex items-end bg-ink-950 px-[var(--gutter)] pb-[12vh] [animation:intro-fallback_0.4s_3s_forwards] [clip-path:inset(0_0_0_0)]"
    >
      <style>{`@keyframes intro-fallback{to{opacity:0;visibility:hidden}}`}</style>
      <div data-content className="mono w-full max-w-md text-[0.7rem] leading-7 text-muted">
        <p data-head className="text-paper">
          MAXI SYSTEM
        </p>
        <p data-head className="mb-6 text-muted-2">
          BUILD 2026 · v1.0
        </p>
        {steps.map((s) => (
          <p key={s} data-step className="flex justify-between opacity-0">
            <span className={s === "READY" ? "text-accent" : ""}>{s}</span>
            <span data-ok className="text-muted-2">
              {s === "READY" ? "●" : "OK"}
            </span>
          </p>
        ))}
        <div className="mt-6 h-px w-full bg-line">
          <div data-bar className="h-px origin-left scale-x-0 bg-paper" />
        </div>
      </div>
    </div>
  );
}
