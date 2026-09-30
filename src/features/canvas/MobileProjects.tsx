"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { projects } from "@/data/projects";
import { ProjectImage } from "@/components/projects/ProjectImage";

/**
 * Phones get a guided version of the map: a swipeable gallery that snaps to one project at a time,
 * with a counter and a small graph that shows where the current project sits.
 */
export function MobileProjects() {
  const track = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = track.current!;
    const items = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(items.indexOf(e.target as HTMLElement));
      },
      { root: el, threshold: 0.6 },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);

  const go = (i: number) => {
    const el = track.current!;
    const item = el.children[Math.max(0, Math.min(projects.length - 1, i))] as HTMLElement;
    el.scrollTo({ left: item.offsetLeft - el.offsetLeft - 16, behavior: "smooth" });
  };

  const active = projects[current];

  return (
    <section id="projects" tabIndex={-1} aria-labelledby="projects-title" className="relative py-24 outline-none">
      <div className="px-[var(--gutter)]">
        <p className="mono text-muted-2">02 — Project graph</p>
        <h2 id="projects-title" className="mt-3 text-4xl font-medium leading-none tracking-tight">
          Selected work,
          <br />
          <span className="text-muted">wired together.</span>
        </h2>
      </div>

      {/* A miniature of the network: every project as a point, the current one lit. */}
      <svg aria-hidden viewBox="-900 -560 1800 1120" className="mx-auto mt-8 h-28 w-full max-w-sm">
        {projects.map((p) => (
          <line
            key={`l-${p.slug}`}
            x1={0}
            y1={0}
            x2={p.position.x}
            y2={p.position.y}
            className={p.slug === active.slug ? "stroke-paper/70" : "stroke-paper/15"}
            strokeWidth={4}
          />
        ))}
        {projects.map((p) => (
          <circle
            key={p.slug}
            cx={p.position.x}
            cy={p.position.y}
            r={p.slug === active.slug ? 34 : 18}
            className={p.slug === active.slug ? "fill-accent" : "fill-paper/40"}
          />
        ))}
        <circle r={44} className="fill-paper" />
      </svg>

      <ol
        ref={track}
        aria-label="Projects"
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((p, i) => (
          <li key={p.slug} className="w-[82vw] max-w-sm shrink-0 snap-start">
            <Link href={`/projects/${p.slug}/`} transitionTypes={["project-open"]} className="block">
              <div className="mono mb-2 flex justify-between text-[0.62rem] text-muted-2">
                <span>
                  <span className="text-paper">{String(i + 1).padStart(2, "0")}</span> / {p.node}
                </span>
                <span>{p.year}</span>
              </div>
              <ProjectImage project={p} sizes="82vw" className="aspect-[2/1] border border-line" distort={false} />
              <p className="mt-4 text-xl font-medium leading-tight tracking-tight">{p.tagline}</p>
              <p className="mono mt-3 text-[0.62rem] text-muted">
                {p.tags.join(" · ")} <span className="text-accent">→</span>
              </p>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center justify-between px-[var(--gutter)]">
        <p className="mono tabular-nums text-muted-2" aria-live="polite">
          <span className="text-paper">{String(current + 1).padStart(2, "0")}</span> / {String(projects.length).padStart(2, "0")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(current - 1)}
            disabled={current === 0}
            className="mono h-11 w-11 border border-line disabled:opacity-30"
            aria-label="Previous project"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(current + 1)}
            disabled={current === projects.length - 1}
            className="mono h-11 w-11 border border-line disabled:opacity-30"
            aria-label="Next project"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
