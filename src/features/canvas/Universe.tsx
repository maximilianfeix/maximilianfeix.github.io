"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, type Project } from "@/data/projects";
import { ProjectImage } from "@/components/projects/ProjectImage";
import { useUI } from "@/store/ui";
import { useReducedMotion } from "@/hooks/useMedia";
import { clamp, lerp, spring } from "@/lib/animation/config";
import { sound } from "@/features/sound/sound";

const BOUNDS = { x: 900, y: 600 };
const CARD_W = 300;

type Edge = { a: { x: number; y: number }; b: { x: number; y: number }; strong: boolean; key: string; slugs: [string, string] };

function buildEdges(list: Project[]): Edge[] {
  const center = { x: 0, y: 0 };
  const seen = new Set<string>();
  const edges: Edge[] = list.map((p) => ({ a: center, b: p.position, strong: false, key: `maxi-${p.slug}`, slugs: ["maxi", p.slug] }));
  for (const p of list) {
    for (const r of p.related) {
      const other = list.find((o) => o.slug === r);
      const key = [p.slug, r].sort().join("~");
      if (!other || seen.has(key)) continue;
      seen.add(key);
      edges.push({ a: p.position, b: other.position, strong: true, key, slugs: [p.slug, r] });
    }
  }
  return edges;
}

// A soft curve between two nodes, bending away from the centre so the network reads as organic, not a grid.
function curve(e: Edge) {
  const mx = (e.a.x + e.b.x) / 2;
  const my = (e.a.y + e.b.y) / 2;
  const dx = e.b.x - e.a.x;
  const dy = e.b.y - e.a.y;
  const bend = e.strong ? 0.18 : 0.08;
  return `M${e.a.x} ${e.a.y} Q${mx - dy * bend} ${my + dx * bend} ${e.b.x} ${e.b.y}`;
}

export function Universe() {
  const section = useRef<HTMLElement>(null);
  // ScrollTrigger wraps the pinned element in a spacer; pinning an inner element keeps React's own nodes where React left them.
  const pinned = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const edges = useMemo(() => buildEdges(projects), []);

  // Camera state lives in a ref: it changes every frame and must never re-render React.
  const cam = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
    zoom: 0.7,
    tzoom: 0.7,
    fit: 0.7,
    scrollZoom: 0,
    rx: 0,
    ry: 0,
    trx: 0,
    try: 0,
    dragging: false,
    moved: 0,
    running: false,
    inView: false,
  });

  // The render loop runs only while the map is on screen and something is still moving.
  const frame = useRef<() => void>(() => {});
  const kick = () => {
    const c = cam.current;
    if (!c.running && c.inView) {
      c.running = true;
      requestAnimationFrame(frame.current);
    }
  };

  const focusNode = (p: { x: number; y: number }) => {
    const c = cam.current;
    c.tx = clamp(-p.x, -BOUNDS.x, BOUNDS.x);
    c.ty = clamp(-p.y, -BOUNDS.y, BOUNDS.y);
    c.vx = c.vy = 0;
    kick();
  };

  useEffect(() => {
    const c = cam.current;
    const follow = reduced ? 1 : spring.canvas;
    frame.current = () => {
      if (!c.dragging && (Math.abs(c.vx) > 0.05 || Math.abs(c.vy) > 0.05)) {
        c.tx = clamp(c.tx + c.vx, -BOUNDS.x, BOUNDS.x);
        c.ty = clamp(c.ty + c.vy, -BOUNDS.y, BOUNDS.y);
        c.vx *= 0.93;
        c.vy *= 0.93;
      }
      c.x = lerp(c.x, c.tx, follow);
      c.y = lerp(c.y, c.ty, follow);
      c.tzoom = c.fit * (1 + c.scrollZoom * 0.3);
      c.zoom = lerp(c.zoom, c.tzoom, follow);
      c.rx = lerp(c.rx, c.trx, 0.06);
      c.ry = lerp(c.ry, c.try, 0.06);
      if (world.current) {
        world.current.style.transform = `translate3d(${c.x * c.zoom}px, ${c.y * c.zoom}px, 0) scale(${c.zoom}) rotateX(${c.rx}deg) rotateY(${c.ry}deg)`;
      }
      if (readout.current)
        readout.current.textContent = `X ${(-c.x).toFixed(0).padStart(4, " ")}  Y ${(-c.y).toFixed(0).padStart(4, " ")}  Z ${c.zoom.toFixed(2)}`;
      const moving =
        Math.abs(c.x - c.tx) + Math.abs(c.y - c.ty) + Math.abs(c.zoom - c.tzoom) + Math.abs(c.rx - c.trx) + Math.abs(c.ry - c.try) > 0.02 ||
        Math.abs(c.vx) + Math.abs(c.vy) > 0.05 ||
        c.dragging;
      if (moving && c.inView) requestAnimationFrame(frame.current);
      else c.running = false;
    };

    const fit = () => {
      const el = viewport.current!;
      c.fit = clamp(Math.min(el.clientWidth / 2150, el.clientHeight / 1450), 0.4, 1);
      kick();
    };
    fit();
    c.zoom = c.tzoom = c.fit;
    window.addEventListener("resize", fit);

    const io = new IntersectionObserver(([entry]) => {
      c.inView = entry.isIntersecting;
      kick();
    });
    io.observe(viewport.current!);

    return () => {
      window.removeEventListener("resize", fit);
      io.disconnect();
    };
  }, [reduced]);

  // Scroll: the section pins, and scrolling through it flies the camera a little closer.
  useEffect(() => {
    if (reduced) return;
    const c = cam.current;
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "+=90%",
      pin: pinned.current,
      onUpdate: (self) => {
        c.scrollZoom = self.progress;
        kick();
      },
    });
    return () => st.kill();
  }, [reduced]);

  // Dragging with inertia, and a gentle tilt toward the pointer.
  useEffect(() => {
    const el = viewport.current!;
    const c = cam.current;
    let startX = 0,
      startY = 0,
      originX = 0,
      originY = 0,
      lastX = 0,
      lastY = 0,
      lastT = 0;

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      c.dragging = true;
      c.moved = 0;
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      originX = c.tx;
      originY = c.ty;
      lastT = performance.now();
      c.vx = c.vy = 0;
      useUI.getState().setCursor("dragging");
      kick();
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (!reduced) {
        c.trx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        c.try = ((e.clientX - r.left) / r.width - 0.5) * 8;
      }
      if (!c.dragging) {
        kick();
        return;
      }
      const dx = (e.clientX - startX) / c.zoom;
      const dy = (e.clientY - startY) / c.zoom;
      c.moved = Math.max(c.moved, Math.hypot(e.clientX - startX, e.clientY - startY));
      if (c.moved > 4) el.setPointerCapture(e.pointerId);
      c.tx = clamp(originX + dx, -BOUNDS.x, BOUNDS.x);
      c.ty = clamp(originY + dy, -BOUNDS.y, BOUNDS.y);
      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      c.vx = ((e.clientX - lastX) / c.zoom / dt) * 16;
      c.vy = ((e.clientY - lastY) / c.zoom / dt) * 16;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    };
    const up = (e: PointerEvent) => {
      if (!c.dragging) return;
      c.dragging = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (reduced) c.vx = c.vy = 0;
      useUI.getState().setCursor("drag");
      kick();
    };
    // A drag that ends on a card must not open it.
    const click = (e: MouseEvent) => {
      if (c.moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const leave = () => {
      c.trx = c.try = 0;
      kick();
    };
    const key = (e: KeyboardEvent) => {
      const step = 80;
      const map: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
      const d = map[e.key];
      if (!d || e.target !== el) return;
      e.preventDefault();
      c.tx = clamp(c.tx + d[0], -BOUNDS.x, BOUNDS.x);
      c.ty = clamp(c.ty + d[1], -BOUNDS.y, BOUNDS.y);
      kick();
    };

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("keydown", key);
    };
  }, [reduced]);

  // Packets: every so often a dot travels along one of the connections.
  useEffect(() => {
    if (reduced) return;
    const root = svg.current!;
    const paths = Array.from(root.querySelectorAll<SVGPathElement>("path[data-edge]"));
    let timer = 0;
    const spawn = () => {
      if (cam.current.inView && !document.hidden) {
        const path = paths[Math.floor(Math.random() * paths.length)];
        const length = path.getTotalLength();
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("r", "3");
        dot.setAttribute("class", path.dataset.strong ? "fill-accent" : "fill-paper");
        root.appendChild(dot);
        const reverse = Math.random() > 0.5;
        const t = { p: 0 };
        gsap.to(t, {
          p: 1,
          duration: 1.4 + length / 900,
          ease: "power1.inOut",
          onUpdate: () => {
            const pt = path.getPointAtLength((reverse ? 1 - t.p : t.p) * length);
            dot.setAttribute("cx", String(pt.x));
            dot.setAttribute("cy", String(pt.y));
            dot.setAttribute("opacity", String(Math.sin(t.p * Math.PI)));
          },
          onComplete: () => dot.remove(),
        });
      }
      timer = window.setTimeout(spawn, 700 + Math.random() * 900);
    };
    timer = window.setTimeout(spawn, 1200);
    return () => clearTimeout(timer);
  }, [reduced]);

  const hoveredProject = projects.find((p) => p.slug === hovered);
  const isLit = (slug: string) =>
    !hovered || slug === hovered || hoveredProject?.related.includes(slug) || projects.find((p) => p.slug === slug)?.related.includes(hovered);

  return (
    <section ref={section} id="projects" tabIndex={-1} aria-labelledby="projects-title" className="relative outline-none">
      <div ref={pinned} className="relative h-svh overflow-hidden">
        {/* Overlay UI: always-visible ways in, so the map is never the only way to reach a project. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-8 px-[var(--gutter)] pt-[calc(var(--nav-h)+1rem)]">
          <div className="pointer-events-auto">
            <p className="mono text-muted-2">02 — Project graph</p>
            <h2 id="projects-title" className="mt-3 max-w-sm text-[clamp(1.6rem,2.6vw,2.4rem)] font-medium leading-none tracking-tight">
              Selected work,
              <br />
              <span className="text-muted">wired together.</span>
            </h2>
          </div>
          <nav aria-label="Projects" className="pointer-events-auto hidden border border-line bg-ink-900/75 p-4 backdrop-blur-md lg:block">
            <ol className="mono grid grid-cols-2 gap-x-8 gap-y-1 text-muted-2">
              {projects.map((p, i) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => focusNode(p.position)}
                    onMouseEnter={() => setHovered(p.slug)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex gap-3 py-1 text-left transition-colors hover:text-paper ${hovered === p.slug ? "text-paper" : ""}`}
                    data-cursor="view"
                    data-cursor-label="FOCUS"
                  >
                    <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {p.node}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div
          ref={viewport}
          tabIndex={0}
          aria-label="Project map. Drag, or focus it and use the arrow keys, to move around. Tab moves through the projects."
          data-cursor="drag"
          className="absolute inset-0 touch-none select-none [perspective:1600px] focus-visible:outline-offset-[-8px]"
        >
          <div
            ref={world}
            className="absolute left-1/2 top-[54%] [transform-style:preserve-3d] will-change-transform"
            style={{ transform: "scale(0.7)" }}
          >
            <svg ref={svg} aria-hidden className="absolute overflow-visible" style={{ left: 0, top: 0, width: 1, height: 1 }}>
              {edges.map((e) => {
                const lit = hovered && e.slugs.includes(hovered);
                return (
                  <path
                    key={e.key}
                    data-edge
                    data-strong={e.strong ? "" : undefined}
                    d={curve(e)}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    className={`transition-[stroke,opacity] duration-500 ${lit ? "stroke-paper/60" : e.strong ? "stroke-paper/20" : "stroke-paper/10"} ${hovered && !lit ? "opacity-30" : ""}`}
                    strokeWidth={1}
                    strokeDasharray={e.strong ? undefined : "2 6"}
                  />
                );
              })}
            </svg>

            {/* MAXI, the centre of the graph */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-line-strong bg-ink-900/80 backdrop-blur-sm">
                <span className="absolute inset-[-14px] rounded-full border border-line [animation:pulse-ring_4s_ease-out_infinite] motion-reduce:hidden" />
                <div className="text-center">
                  <p className="text-2xl font-semibold tracking-[0.25em]">MAXI</p>
                  <p className="mono mt-1 text-[0.6rem] text-muted-2">you are here</p>
                </div>
              </div>
            </div>

            {projects.map((p, i) => (
              <Node
                key={p.slug}
                project={p}
                index={i}
                dimmed={!isLit(p.slug)}
                onHover={setHovered}
                onFocus={() => focusNode(p.position)}
                reduced={reduced}
              />
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-[var(--gutter)] pb-6">
          <p className="mono text-muted-2">
            <span className="text-paper">Drag</span> to explore · <span className="text-paper">click</span> a node to enter
          </p>
          <div className="pointer-events-auto flex items-center gap-6">
            <span ref={readout} aria-hidden className="mono hidden whitespace-pre tabular-nums text-muted-2 md:inline" />
            <button
              type="button"
              onClick={() => focusNode({ x: 0, y: 0 })}
              className="mono py-2 text-muted transition-colors hover:text-paper"
              data-cursor="view"
            >
              Reset view
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Node({
  project: p,
  index,
  dimmed,
  onHover,
  onFocus,
  reduced,
}: {
  project: Project;
  index: number;
  dimmed: boolean;
  onHover: (slug: string | null) => void;
  onFocus: () => void;
  reduced: boolean;
}) {
  const card = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  // Tilt and a slight magnetic pull toward the pointer while hovered.
  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === "touch") return;
    const el = card.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--tx", `${(-py * 10).toFixed(2)}deg`);
      el.style.setProperty("--ty", `${(px * 12).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 18).toFixed(1)}px`);
      el.style.setProperty("--my", `${(py * 14).toFixed(1)}px`);
    });
  };
  const reset = () => {
    const el = card.current!;
    for (const v of ["--tx", "--ty", "--mx", "--my"]) el.style.setProperty(v, "0");
  };

  return (
    <div
      className="group/node absolute [transform-style:preserve-3d]"
      style={{ left: p.position.x, top: p.position.y, width: CARD_W, transform: `translate(-50%, -50%) translateZ(${p.position.z}px)` }}
    >
      <Link
        href={`/projects/${p.slug}/`}
        transitionTypes={["project-open"]}
        onPointerEnter={() => {
          onHover(p.slug);
        }}
        onPointerLeave={() => {
          onHover(null);
          reset();
        }}
        onPointerMove={onMove}
        onFocus={(e) => {
          onHover(p.slug);
          // Only keyboard focus moves the camera – a click must land on the card it started on.
          if (e.currentTarget.matches(":focus-visible")) onFocus();
        }}
        onBlur={() => onHover(null)}
        onClick={() => sound.whoosh()}
        data-cursor="open"
        draggable={false}
        className="block outline-none"
        aria-label={`${p.name} – ${p.tagline}`}
      >
        <div
          ref={card}
          className={`relative [transform-style:preserve-3d] transition-[transform,opacity,filter] duration-700 ease-[var(--ease-out-expo)] group-hover/node:[--lift:70px] group-hover/node:[--s:1.04] group-focus-within/node:[--lift:70px] ${
            dimmed ? "opacity-25 [filter:grayscale(1)]" : "opacity-100"
          }`}
          style={{
            transform: "translate3d(var(--mx,0), var(--my,0), var(--lift,0px)) rotateX(var(--tx,0)) rotateY(var(--ty,0)) scale(var(--s,1))",
          }}
        >
          <div className="mono mb-2 flex items-baseline justify-between text-[0.62rem] text-muted-2 [transform:translateZ(30px)]">
            <span>
              <span className="text-paper">{String(index + 1).padStart(2, "0")}</span> / {p.node}
            </span>
            <span>{p.year}</span>
          </div>
          <div className="relative border border-line transition-colors duration-500 group-hover/node:border-line-strong group-focus-within/node:border-accent">
            <ProjectImage project={p} sizes="300px" className="aspect-[2/1]" />
          </div>
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[var(--ease-out-expo)] group-hover/node:grid-rows-[1fr] group-focus-within/node:grid-rows-[1fr] [transform:translateZ(45px)]">
            <div className="overflow-hidden">
              <div className="flex items-end justify-between gap-4 pt-3">
                <ul className="mono flex flex-col gap-0.5 text-[0.62rem] text-muted">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <span className="mono shrink-0 text-[0.62rem] text-paper">
                  View project <span className="text-accent">→</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
