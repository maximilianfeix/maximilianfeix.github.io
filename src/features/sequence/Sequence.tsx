"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useMedia";
import { useUI } from "@/store/ui";

const words = [
  { word: "BUILD", line: "Start with something that works." },
  { word: "BREAK", line: "Then find out where it doesn't." },
  { word: "LEARN", line: "Understand why – write it down." },
  { word: "SHIP", line: "Put it in front of people. Repeat." },
];

/**
 * Four words, one screen each. The section pins and scrolling drives a single timeline:
 * each word is revealed, then the camera flies through it into the next.
 */
export function Sequence() {
  const root = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: `+=${scenes.length * 90}%`,
          pin: pinned.current,
          scrub: 0.6,
          onToggle: (self) => useUI.getState().setNavHidden(self.isActive),
          onUpdate: (self) => {
            gsap.set("[data-progress]", { scaleX: self.progress });
            const i = Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length));
            const counter = root.current?.querySelector("[data-counter]");
            if (counter) counter.textContent = String(i + 1).padStart(2, "0");
          },
        },
      });

      scenes.forEach((scene, i) => {
        const word = scene.querySelector("[data-word]");
        const halves = scene.querySelectorAll("[data-half]");
        const chars = scene.querySelectorAll("[data-c]");
        const line = scene.querySelector("[data-line]");
        const at = i * 3;
        tl.set(scene, { autoAlpha: 1 }, at);

        // Arrival – each word enters in its own way.
        if (i === 0) tl.fromTo(chars, { yPercent: 105 }, { yPercent: 0, stagger: 0.12, duration: 1 }, at);
        if (i === 1) tl.fromTo(word, { scale: 0.55, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1 }, at);
        if (i === 2)
          tl.fromTo(
            chars,
            { yPercent: (k: number) => (k % 2 ? -1 : 1) * 120, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, stagger: 0.08, duration: 1 },
            at,
          );
        if (i === 3) tl.fromTo(word, { xPercent: 40, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1 }, at);
        tl.fromTo(line, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, at + 0.5);

        // BREAK splits along its middle before it leaves.
        if (i === 1) tl.to(halves[0], { xPercent: -6, duration: 0.8 }, at + 1.2).to(halves[1], { xPercent: 6, duration: 0.8 }, at + 1.2);

        // Departure – the camera flies through the word (the last one stays for a beat, then goes).
        tl.to(line, { autoAlpha: 0, duration: 0.4 }, at + 2);
        tl.to(word, { scale: 9, autoAlpha: 0, duration: 1, ease: "power2.in" }, at + 2);
        tl.set(scene, { autoAlpha: 0 }, at + 3);
      });
    }, root);
    return () => {
      ctx.revert();
      useUI.getState().setNavHidden(false);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section key="static" aria-label="How I work" className="px-[var(--gutter)] py-32">
        <ol className="grid gap-16 md:grid-cols-2">
          {words.map((w) => (
            <li key={w.word}>
              <p className="display text-[clamp(4rem,12vw,10rem)]">{w.word}</p>
              <p className="mono mt-4 text-muted">{w.line}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section key="pinned" ref={root} aria-label="How I work" className="relative">
      <div ref={pinned} className="relative h-svh overflow-hidden">
        <h2 className="sr-only">How I work: build, break, learn, ship.</h2>
        {words.map((w, i) => (
          <div key={w.word} data-scene className="invisible absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
            <div data-word className="relative will-change-transform">
              {i === 1 ? (
                // Two clipped copies of BREAK: top half and bottom half, so it can split along the middle.
                <div className="relative">
                  <p className="display text-[length:var(--text-mega)] opacity-0">{w.word}</p>
                  <p data-half className="display absolute inset-0 text-[length:var(--text-mega)] [clip-path:inset(0_0_50%_0)]">
                    {w.word}
                  </p>
                  <p data-half className="display absolute inset-0 text-[length:var(--text-mega)] text-paper-dim [clip-path:inset(50%_0_0_0)]">
                    {w.word}
                  </p>
                </div>
              ) : (
                <p className="display flex text-[length:var(--text-mega)] [clip-path:inset(-10%_-5%)]">
                  {[...w.word].map((c, k) => (
                    <span key={k} data-c className="inline-block">
                      {c}
                    </span>
                  ))}
                </p>
              )}
            </div>
            <p data-line className="mono mt-6 text-muted">
              {w.line}
            </p>
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-6 px-[var(--gutter)] pb-8">
          <span className="mono tabular-nums text-muted-2">
            <span data-counter className="text-paper">
              01
            </span>{" "}
            / 04
          </span>
          <span className="h-px flex-1 bg-line">
            <span data-progress className="block h-px origin-left scale-x-0 bg-paper" />
          </span>
          <span className="mono text-muted-2">Process</span>
        </div>
      </div>
    </section>
  );
}
