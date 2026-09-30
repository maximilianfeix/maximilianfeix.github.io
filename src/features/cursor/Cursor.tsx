"use client";

import { useEffect, useRef } from "react";
import { useUI, type CursorMode } from "@/store/ui";
import { useCoarsePointer, useReducedMotion } from "@/hooks/useMedia";
import { lerp, spring } from "@/lib/animation/config";
import { sound } from "@/features/sound/sound";

/** Shared pointer state, readable by any effect without re-rendering. */
export const pointer = { x: 0, y: 0, vx: 0, vy: 0, speed: 0 };

const sizes: Record<CursorMode, number> = { default: 10, hover: 44, drag: 84, dragging: 64, open: 96, view: 64, hidden: 0 };

/**
 * A small circle that follows the pointer and grows into a label over interactive things.
 * Elements opt in with data-cursor="open|view|drag|hover" (and optional data-cursor-label).
 */
export function Cursor() {
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (coarse) return;
    document.documentElement.classList.add("has-cursor");
    const el = dot.current!;
    let x = -100,
      y = -100,
      tx = -100,
      ty = -100,
      lastX = 0,
      lastY = 0,
      raf = 0,
      visible = false;
    let current: CursorMode = "default";
    const follow = reduced ? 1 : spring.cursor;

    const render = () => {
      x = lerp(x, tx, follow);
      y = lerp(y, ty, follow);
      pointer.vx = lerp(pointer.vx, tx - lastX, 0.2);
      pointer.vy = lerp(pointer.vy, ty - lastY, 0.2);
      pointer.speed = Math.hypot(pointer.vx, pointer.vy);
      lastX = tx;
      lastY = ty;
      // The dot stretches a little along the direction of travel.
      const stretch = reduced || current !== "default" ? 1 : Math.min(1 + pointer.speed / 60, 1.6);
      const angle = stretch > 1 ? Math.atan2(pointer.vy, pointer.vx) : 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${angle}rad) scale(${stretch}, ${1 / stretch})`;
      raf = Math.abs(x - tx) + Math.abs(y - ty) + pointer.speed > 0.05 ? requestAnimationFrame(render) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tx = e.clientX;
      ty = e.clientY;
      pointer.x = tx;
      pointer.y = ty;
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        el.style.opacity = "1";
      }
      if (!raf) raf = requestAnimationFrame(render);
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, [role='button'], input, textarea, select, label");
      const mode = (target?.dataset.cursor as CursorMode | undefined) ?? (target ? "hover" : "default");
      const store = useUI.getState();
      if (store.cursor === "dragging") return;
      if (mode !== store.cursor) {
        store.setCursor(mode, target?.dataset.cursorLabel);
        if (mode !== "default") sound.tick();
      }
    };

    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };

    const unsubscribe = useUI.subscribe((s) => {
      current = s.cursor;
      el.style.width = el.style.height = `${sizes[s.cursor]}px`;
      el.dataset.mode = s.cursor;
      if (label.current) label.current.textContent = s.cursorLabel;
      // Redraw once, so a label never keeps the stretch and rotation of the plain dot.
      if (!raf && visible) raf = requestAnimationFrame(render);
    });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, [coarse, reduced]);

  if (coarse) return null;

  return (
    <div
      ref={dot}
      aria-hidden
      data-mode="default"
      className="pointer-events-none fixed left-0 top-0 z-[90] flex h-[10px] w-[10px] items-center justify-center rounded-full bg-paper opacity-0 transition-[width,height,background-color,border-color,opacity] duration-500 ease-[var(--ease-out-expo)] will-change-transform data-[mode=default]:mix-blend-difference data-[mode=hover]:border data-[mode=hover]:border-paper/80 data-[mode=hover]:bg-transparent"
    >
      <span ref={label} className="mono whitespace-nowrap text-[0.62rem] text-ink-900" />
    </div>
  );
}
