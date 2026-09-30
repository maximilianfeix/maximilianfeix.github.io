import { create } from "zustand";

export type CursorMode = "default" | "hover" | "drag" | "dragging" | "open" | "view" | "hidden";
export type Quality = "high" | "low" | "off";

type UIState = {
  cursor: CursorMode;
  cursorLabel: string;
  setCursor: (mode: CursorMode, label?: string) => void;
  introDone: boolean;
  setIntroDone: () => void;
  sound: boolean;
  toggleSound: () => void;
  navHidden: boolean;
  setNavHidden: (hidden: boolean) => void;
  quality: Quality;
  setQuality: (q: Quality) => void;
};

const labels: Partial<Record<CursorMode, string>> = { drag: "DRAG", dragging: "DRAG", open: "OPEN", view: "VIEW" };

export const useUI = create<UIState>((set) => ({
  cursor: "default",
  cursorLabel: "",
  setCursor: (cursor, label) => set({ cursor, cursorLabel: label ?? labels[cursor] ?? "" }),
  introDone: false,
  setIntroDone: () => set({ introDone: true }),
  sound: false,
  toggleSound: () => set((s) => ({ sound: !s.sound })),
  navHidden: false,
  setNavHidden: (navHidden) => set({ navHidden }),
  quality: "high",
  setQuality: (quality) => set({ quality }),
}));
