"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { technologies } from "@/data/stack";
import { projects } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useMedia";
import { lerp } from "@/lib/animation/config";

// Languages on the inner orbit, everything else on the outer one.
const inner = technologies.filter((t) => t.group === "language");
const outer = technologies.filter((t) => t.group !== "language");
const place = (i: number, n: number, radius: number, offset: number) => {
  const a = (i / n) * Math.PI * 2 + offset;
  return { x: 50 + Math.cos(a) * radius, y: 50 + Math.sin(a) * radius * 0.86 };
};
const nodes = [
  ...inner.map((t, i) => ({ tech: t, ring: 0, ...place(i, inner.length, 22, -Math.PI / 2) })),
  ...outer.map((t, i) => ({ tech: t, ring: 1, ...place(i, outer.length, 44, -Math.PI / 2 + 0.2) })),
];

export function About() {
  const [active, setActive] = useState<string | null>(null);
  const field = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const tech = technologies.find((t) => t.name === active);
  const related = tech ? projects.filter((p) => tech.projects.includes(p.slug)) : [];

  // The two orbits drift against each other with the pointer – depth without spinning.
  useEffect(() => {
    if (reduced) return;
    const el = field.current!;
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0,
      raf = 0;
    const loop = () => {
      x = lerp(x, tx, 0.07);
      y = lerp(y, ty, 0.07);
      el.style.setProperty("--ox", `${(x * 14).toFixed(2)}px`);
      el.style.setProperty("--oy", `${(y * 14).toFixed(2)}px`);
      raf = Math.abs(x - tx) + Math.abs(y - ty) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top - 200 || e.clientY > r.bottom + 200) return;
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section id="about" tabIndex={-1} aria-labelledby="about-title" className="relative px-[var(--gutter)] py-32 outline-none md:py-40">
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <p className="mono text-muted-2">05 — About</p>
          <h2 id="about-title" className="mt-6 text-[clamp(2.2rem,4.4vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            I&apos;m Maximilian Feix.
          </h2>
          <div className="mt-8 max-w-md space-y-5 text-lg leading-relaxed text-paper-dim">
            <p>Software developer focused on web applications, developer tools, infrastructure and experimental interfaces.</p>
            <p>
              Day to day that means APIs, pipelines and the automation that keeps a hosting company running. In my own time I build tools that do one
              job properly and show their work – tested, documented, released.
            </p>
            <p className="text-muted">I like building things that are technically useful but also enjoyable to interact with.</p>
          </div>

          {/* The answer to "what did you build with it?" – filled by hovering or focusing a technology. */}
          <div className="mt-12 min-h-40 border-t border-line pt-6" aria-live="polite">
            {tech ? (
              <>
                <p className="mono text-muted-2">
                  Built with <span className="text-accent">{tech.name}</span>
                </p>
                {related.length ? (
                  <ul className="mt-4 space-y-2">
                    {related.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/projects/${p.slug}/`}
                          transitionTypes={["project-open"]}
                          className="group flex items-baseline justify-between gap-4 text-xl tracking-tight"
                          data-cursor="view"
                        >
                          <span className="transition-colors group-hover:text-accent">{p.name}</span>
                          <span className="mono text-muted-2">{p.year}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-muted">{tech.name === "Next.js" ? "This website." : "School and side work – nothing public yet."}</p>
                )}
              </>
            ) : (
              <p className="mono text-muted-2">Pick a technology to see what I built with it.</p>
            )}
          </div>
        </div>

        <div ref={field} className="relative aspect-square w-full lg:col-span-7" onMouseLeave={() => setActive(null)}>
          <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
            <ellipse cx="50" cy="50" rx="22" ry={22 * 0.86} className="fill-none stroke-paper/10" strokeWidth={0.15} />
            <ellipse cx="50" cy="50" rx="44" ry={44 * 0.86} className="fill-none stroke-paper/10" strokeWidth={0.15} strokeDasharray="0.4 1.2" />
            {nodes.map((n) => {
              const lit = active === n.tech.name;
              return (
                <line
                  key={n.tech.name}
                  x1="50"
                  y1="50"
                  x2={n.x}
                  y2={n.y}
                  strokeWidth={lit ? 0.25 : 0.12}
                  className={`transition-[stroke] duration-500 ${lit ? "stroke-accent" : "stroke-paper/15"}`}
                />
              );
            })}
          </svg>

          <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-ink-900 md:h-32 md:w-32">
            <span className="text-lg font-semibold tracking-[0.25em] md:text-xl">MAXI</span>
          </div>

          <ul aria-label="Technologies">
            {nodes.map((n) => {
              const lit = active === n.tech.name;
              const dim = active && !lit;
              return (
                <li
                  key={n.tech.name}
                  className="absolute"
                  style={{
                    transform: "translate(-50%, -50%)",
                    left: `${n.x}%`,
                    top: `${n.y}%`,
                    translate: n.ring ? "var(--ox, 0) var(--oy, 0)" : "calc(var(--ox, 0) * -0.5) calc(var(--oy, 0) * -0.5)",
                  }}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActive(n.tech.name)}
                    onFocus={() => setActive(n.tech.name)}
                    onClick={() => setActive(n.tech.name)}
                    aria-pressed={lit}
                    data-cursor="view"
                    data-cursor-label="SHOW"
                    className={`mono whitespace-nowrap border px-2.5 py-1.5 text-[0.62rem] transition-all duration-500 md:text-[0.68rem] ${
                      lit ? "border-accent bg-accent text-ink-900" : "border-line bg-ink-900/90 text-paper-dim hover:border-line-strong"
                    } ${dim ? "opacity-40" : ""}`}
                  >
                    {n.tech.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
