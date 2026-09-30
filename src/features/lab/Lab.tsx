"use client";

import { useEffect, useRef } from "react";
import { experiments } from "@/data/experiments";
import { spring } from "@/lib/animation/config";
import { useMedia, useReducedMotion } from "@/hooks/useMedia";

// Resting places on the desk, in % of the stage, with a slight rotation each.
const rest = [
  { x: 4, y: 6, r: -3 },
  { x: 36, y: 0, r: 2 },
  { x: 70, y: 8, r: -1.5 },
  { x: 16, y: 40, r: 1.5 },
  { x: 52, y: 36, r: -2.5 },
  { x: 80, y: 48, r: 3 },
  { x: 6, y: 72, r: 2 },
  { x: 44, y: 70, r: -1 },
];

type Body = { el: HTMLElement; x: number; y: number; vx: number; vy: number; held: boolean; moved: number };

/**
 * Small projects as physical objects: they drift away from the pointer, can be picked up and thrown,
 * and settle back to where they belong on a spring. On phones and with reduced motion it's a plain list.
 */
export function Lab() {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const desktop = useMedia("(min-width: 768px) and (hover: hover)", true);
  const physics = desktop && !reduced;

  useEffect(() => {
    if (!physics) return;
    const root = stage.current!;
    const bodies: Body[] = Array.from(root.querySelectorAll<HTMLElement>("[data-body]")).map((el) => ({
      el,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      held: false,
      moved: 0,
    }));
    const { stiffness, damping } = spring.physics;
    let px = -9999,
      py = -9999,
      raf = 0,
      inView = false;
    let grab: { body: Body; dx: number; dy: number; lx: number; ly: number } | null = null;

    const step = () => {
      let energy = 0;
      // Read every position first, then write – never interleave layout reads and style writes.
      const centers = bodies.map((b) => {
        const r = b.el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      for (const [i, b] of bodies.entries()) {
        if (!b.held) {
          // Push away from the pointer, strongest when it's right on top.
          const dx = centers[i].x - px;
          const dy = centers[i].y - py;
          const d = Math.hypot(dx, dy);
          if (d < 220 && d > 0) {
            const f = (1 - d / 220) * 1.6;
            b.vx += (dx / d) * f;
            b.vy += (dy / d) * f;
          }
          b.vx = (b.vx - b.x * stiffness) * damping;
          b.vy = (b.vy - b.y * stiffness) * damping;
          b.x += b.vx;
          b.y += b.vy;
        }
        energy += Math.abs(b.x) + Math.abs(b.y) + Math.abs(b.vx) + Math.abs(b.vy);
        b.el.style.translate = `${b.x.toFixed(2)}px ${b.y.toFixed(2)}px`;
        b.el.style.setProperty("--spin", `${(b.vx * 0.6).toFixed(2)}deg`);
      }
      raf = inView && (energy > 0.3 || grab || px > -9999) ? requestAnimationFrame(step) : 0;
    };
    const wake = () => {
      if (!raf && inView) raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const inside = e.clientX > r.left - 100 && e.clientX < r.right + 100 && e.clientY > r.top - 100 && e.clientY < r.bottom + 100;
      px = inside ? e.clientX : -9999;
      py = inside ? e.clientY : -9999;
      if (grab) {
        const b = grab.body;
        b.moved = Math.max(b.moved, Math.hypot(e.clientX - grab.lx, e.clientY - grab.ly));
        b.vx = e.clientX - grab.dx - b.x;
        b.vy = e.clientY - grab.dy - b.y;
        b.x = e.clientX - grab.dx;
        b.y = e.clientY - grab.dy;
      }
      if (inside) wake();
    };
    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-body]");
      const body = bodies.find((b) => b.el === el);
      if (!body || e.button !== 0) return;
      body.held = true;
      body.moved = 0;
      grab = { body, dx: e.clientX - body.x, dy: e.clientY - body.y, lx: e.clientX, ly: e.clientY };
      body.el.style.zIndex = "5";
      wake();
    };
    const onUp = () => {
      if (!grab) return;
      grab.body.held = false;
      grab.body.el.style.zIndex = "";
      grab = null;
      wake();
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-body]");
      const body = bodies.find((b) => b.el === el);
      if (body && body.moved > 6) e.preventDefault();
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      wake();
    });
    io.observe(root);
    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    root.addEventListener("click", onClick, true);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("click", onClick, true);
      for (const b of bodies) b.el.style.translate = "";
    };
  }, [physics]);

  return (
    <section id="lab" tabIndex={-1} aria-labelledby="lab-title" className="relative px-[var(--gutter)] py-32 outline-none md:py-40">
      <div className="mb-16 grid gap-6 md:grid-cols-12">
        <p className="mono text-muted-2 md:col-span-3">04 — Lab</p>
        <h2 id="lab-title" className="text-[clamp(2.4rem,6vw,6rem)] font-semibold leading-[0.9] tracking-[-0.04em] md:col-span-9">
          Small things,
          <br />
          <span className="text-muted">built to learn.</span>
        </h2>
      </div>

      <div ref={stage} className={physics ? "relative h-[min(92vh,860px)] touch-none" : "grid gap-4 sm:grid-cols-2"}>
        {experiments.map((x, i) => {
          const p = rest[i % rest.length];
          return (
            <a
              key={x.name}
              href={x.href}
              target="_blank"
              rel="noreferrer"
              data-body
              data-cursor="view"
              draggable={false}
              className={`group block select-none border border-line bg-ink-800/80 p-5 backdrop-blur-sm transition-[border-color,background-color] duration-500 hover:border-line-strong hover:bg-ink-700/80 ${
                physics ? "absolute w-[min(22vw,300px)] will-change-[translate]" : ""
              }`}
              style={physics ? { left: `${p.x}%`, top: `${p.y}%`, rotate: `calc(${p.r}deg + var(--spin, 0deg))` } : undefined}
            >
              <div className="mono flex justify-between text-[0.62rem] text-muted-2">
                <span>{x.kind}</span>
                <span>{x.year}</span>
              </div>
              <p className="mt-8 text-2xl font-medium tracking-tight">{x.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{x.description}</p>
              <p className="mono mt-6 text-[0.62rem] text-paper-dim">
                Open on GitHub <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">↗</span>
              </p>
            </a>
          );
        })}
        {physics && <p className="mono absolute bottom-0 right-0 text-muted-2">Pick one up. Throw it.</p>}
      </div>
    </section>
  );
}
