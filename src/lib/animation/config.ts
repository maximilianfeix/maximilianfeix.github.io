// One motion language for the whole site. Every tween reads its timing from here.

export const duration = {
  instant: 0.12,
  fast: 0.28,
  base: 0.6,
  slow: 1.0,
  cinematic: 1.6,
} as const;

// GSAP ease strings, and the same curves as CSS for transitions outside GSAP.
export const ease = {
  out: "expo.out",
  inOut: "expo.inOut",
  soft: "power3.out",
  exit: "power2.in",
} as const;

export const cssEase = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.87, 0, 0.13, 1)",
  exit: "cubic-bezier(0.55, 0, 1, 0.45)",
} as const;

export const stagger = {
  letters: 0.025,
  lines: 0.08,
  items: 0.06,
} as const;

// Critically damped-ish springs for pointer-driven motion (per-frame lerp factors and spring constants).
export const spring = {
  cursor: 0.22,
  magnetic: 0.14,
  canvas: 0.09,
  tilt: 0.12,
  physics: { stiffness: 0.045, damping: 0.86 },
} as const;

// Global multiplier: 1 on capable devices, lower on weak ones, 0 under reduced motion.
export const intensity = {
  full: 1,
  low: 0.5,
  none: 0,
} as const;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
