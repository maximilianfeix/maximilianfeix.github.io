"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useUI } from "@/store/ui";
import { useReducedMotion } from "@/hooks/useMedia";
import { duration, ease, lerp, stagger } from "@/lib/animation/config";
import { Magnetic } from "@/components/ui/Magnetic";
import { getLenis } from "@/features/scroll/SmoothScroll";
import { site } from "@/lib/site";

// Letter groups get their own depth, so the name comes apart in layers as the page scrolls.
const lines = [
  { word: "MAXIMILIAN", groups: ["MAX", "IMI", "LIAN"] },
  { word: "FEIX", groups: ["FE", "IX"] },
];
const depths = [120, -60, 200, -140, 80];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const introDone = useUI((s) => s.introDone);
  const reduced = useReducedMotion();

  // Entrance, once the boot sequence hands over.
  useEffect(() => {
    if (!introDone) return;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set("[data-char]", { y: 0, yPercent: 0 });
        gsap.set("[data-fade]", { opacity: 1 });
        return;
      }
      gsap
        .timeline()
        .fromTo("[data-char]", { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: duration.cinematic, ease: ease.out, stagger: stagger.letters })
        .fromTo("[data-fade]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: duration.slow, ease: ease.out, stagger: stagger.lines }, 0.5)
        .fromTo("[data-rule]", { scaleX: 0 }, { scaleX: 1, duration: duration.cinematic, ease: ease.inOut }, 0.2);
    }, root);
    return () => ctx.revert();
  }, [introDone, reduced]);

  // Scroll: letter groups travel along Z at different rates, the whole name recedes a little.
  useEffect(() => {
    if (reduced) return;
    const el = root.current!;
    const ctx = gsap.context(() => {
      const groups = gsap.utils.toArray<HTMLElement>("[data-group]");
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      groups.forEach((g, i) => tl.to(g, { z: depths[i % depths.length] * 2.2, y: (i % 2 ? 1 : -1) * 40, ease: "none" }, 0));
      tl.to(stage.current, { scale: 0.86, opacity: 0.15, ease: "none" }, 0).to("[data-parallax]", { yPercent: -60, ease: "none" }, 0);
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  // Pointer: the stage tilts toward the cursor with a heavy, delayed follow.
  useEffect(() => {
    if (reduced) return;
    const el = stage.current!;
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0,
      raf = 0;
    const loop = () => {
      x = lerp(x, tx, 0.06);
      y = lerp(y, ty, 0.06);
      el.style.setProperty("--rx", `${(-y * 6).toFixed(3)}deg`);
      el.style.setProperty("--ry", `${(x * 9).toFixed(3)}deg`);
      raf = Math.abs(x - tx) + Math.abs(y - ty) > 0.0008 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const enter = () => {
    const target = document.getElementById("projects");
    if (!target) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    target.focus({ preventScroll: true });
  };

  let groupIndex = 0;

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh flex-col justify-between overflow-hidden px-[var(--gutter)] pb-10 pt-[calc(var(--nav-h)+2rem)]"
    >
      <div className="mono flex justify-between gap-4 text-muted-2" data-parallax>
        <span data-fade className="whitespace-nowrap opacity-0">
          49.11°N · 10.75°E
        </span>
        <span data-fade className="hidden opacity-0 sm:inline">
          Portfolio · 2026
        </span>
        <span data-fade className="whitespace-nowrap opacity-0 max-sm:hidden">
          Open to interesting work
        </span>
      </div>

      <div className="py-10 [perspective:1400px]">
        <div ref={stage} className="origin-[50%_60%] [transform-style:preserve-3d] [transform:rotateX(var(--rx,0))_rotateY(var(--ry,0))]">
          <h1 id="hero-title" className="display select-none text-[length:var(--text-display)] [transform-style:preserve-3d]" aria-label={site.name}>
            {lines.map((line) => (
              <span
                key={line.word}
                aria-hidden
                className="flex [transform-style:preserve-3d] last:justify-end last:pr-[4vw] max-sm:last:justify-start"
              >
                {line.groups.map((g) => {
                  const i = groupIndex++;
                  return (
                    <span key={g} data-group data-depth={i} className="inline-flex [clip-path:inset(-20%_-5%_-8%_-5%)] [transform-style:preserve-3d]">
                      {[...g].map((ch, c) => (
                        <span key={c} data-char className="inline-block will-change-transform" style={{ transform: "translateY(110%)" }}>
                          {ch}
                        </span>
                      ))}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <div data-rule className="h-px origin-left bg-line-strong md:col-span-12" />
        <p data-fade className="text-[clamp(1.15rem,2.2vw,1.9rem)] font-medium leading-tight tracking-tight opacity-0 md:col-span-5">
          Creative software developer.
          <span className="block text-muted">I build software, tools and interactive things for the internet.</span>
        </p>
        <p data-fade className="mono max-w-xs leading-6 text-muted-2 opacity-0 md:col-span-4 md:col-start-7">
          Backend &amp; infrastructure by day, developer tools and experiments by night.
        </p>
        <div data-fade className="opacity-0 md:col-span-3 md:justify-self-end">
          <Magnetic>
            <button
              type="button"
              onClick={enter}
              data-cursor="view"
              data-cursor-label="ENTER"
              className="group flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-full border border-line-strong text-center transition-colors duration-500 hover:border-paper hover:bg-paper hover:text-ink-900 md:h-32 md:w-32"
            >
              <span className="mono leading-4">
                Enter the
                <br />
                system
              </span>
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-y-1">
                ↓
              </span>
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
