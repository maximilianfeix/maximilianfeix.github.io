"use client";

import { useUI } from "@/store/ui";
import { sound } from "./sound";

export function SoundToggle() {
  const on = useUI((s) => s.sound);
  const toggle = useUI((s) => s.toggleSound);
  return (
    <button
      type="button"
      onClick={() => {
        toggle();
        // The confirmation is audible only when switching on, which is the point.
        setTimeout(sound.confirm, 0);
      }}
      aria-pressed={on}
      aria-label={on ? "Turn interface sounds off" : "Turn interface sounds on"}
      className="mono group inline-flex h-11 items-center gap-2 text-muted transition-colors hover:text-paper"
      data-cursor="view"
    >
      <span aria-hidden className="flex h-3 items-end gap-[2px]">
        {[0.5, 1, 0.7, 0.9].map((h, i) => (
          <span
            key={i}
            className={`w-[2px] bg-current transition-all duration-500 ${on ? "animate-pulse" : ""}`}
            style={{ height: on ? `${h * 100}%` : "25%", animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
      <span>Sound {on ? "on" : "off"}</span>
    </button>
  );
}
