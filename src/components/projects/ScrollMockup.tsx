"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Project } from "@/data/projects";
import { ProjectImage } from "./ProjectImage";

/** The project in a browser frame that straightens up from a tilted, receding plane as it scrolls into place. */
export function ScrollMockup({ project }: { project: Project }) {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(
      frame.current,
      { rotateX: 28, rotateZ: -3, scale: 0.86, yPercent: 8 },
      {
        rotateX: 0,
        rotateZ: 0,
        scale: 1,
        yPercent: 0,
        ease: "none",
        scrollTrigger: { trigger: frame.current, start: "top bottom", end: "center center", scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const host = project.website ? new URL(project.website).host + new URL(project.website).pathname : `github.com/maximilianfeix`;

  return (
    <div className="[perspective:1400px]">
      <div
        ref={frame}
        className="origin-[50%_100%] border border-line-strong bg-ink-800 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)] will-change-transform"
      >
        <div className="flex items-center gap-4 border-b border-line px-4 py-3">
          <span aria-hidden className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ink-600" />
            <span className="h-2 w-2 rounded-full bg-ink-600" />
            <span className="h-2 w-2 rounded-full bg-ink-600" />
          </span>
          <span className="mono truncate text-[0.6rem] normal-case tracking-normal text-muted-2">{host}</span>
        </div>
        <ProjectImage project={project} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[2/1]" morph={false} />
      </div>
    </div>
  );
}
