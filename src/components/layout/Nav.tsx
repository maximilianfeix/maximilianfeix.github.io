"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { navItems, site } from "@/lib/site";
import { useUI } from "@/store/ui";
import { SoundToggle } from "@/features/sound/SoundToggle";
import { duration, ease } from "@/lib/animation/config";

export function Nav() {
  const ref = useRef<HTMLElement>(null);
  const hidden = useUI((s) => s.navHidden);
  const [compact, setCompact] = useState(false);
  const pathname = usePathname();
  // The menu remembers the page it was opened on, so navigating anywhere closes it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean | ((o: boolean) => boolean)) => setOpenOn((typeof next === "function" ? next(open) : next) ? pathname : null);

  // Compress once the page has moved past the first screen, hide while scrolling down.
  useEffect(() => {
    let last = 0;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        setCompact(y > 80);
        const down = y > last && y > window.innerHeight * 0.6;
        last = y;
        gsap.to(ref.current, { yPercent: down || useUI.getState().navHidden ? -120 : 0, duration: duration.base, ease: ease.out, overwrite: "auto" });
      },
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    gsap.to(ref.current, { yPercent: hidden ? -120 : 0, duration: duration.base, ease: ease.out, overwrite: "auto" });
  }, [hidden]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={ref} style={{ viewTransitionName: "site-nav" }} className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Main"
        className={`flex items-center justify-between px-[var(--gutter)] transition-[height,background-color,border-color] duration-500 ease-[var(--ease-out-expo)] ${
          compact ? "h-14 border-b border-line bg-ink-900/70 backdrop-blur-md" : "h-[var(--nav-h)] border-b border-transparent"
        }`}
      >
        <Link href="/" className="group flex items-baseline gap-3" data-cursor="view" aria-label={`${site.name} – home`}>
          <span className="text-sm font-semibold tracking-[0.2em]">{site.short}</span>
          <span className="mono hidden text-muted-2 transition-colors group-hover:text-muted sm:inline">/ creative software developer</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-8">
            {navItems.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="mono group relative inline-flex gap-2 py-2 text-paper-dim transition-colors hover:text-paper"
                  data-cursor="view"
                >
                  <span className="text-muted-2">0{i + 1}</span>
                  <span>{item.label}</span>
                  <span className="absolute inset-x-0 bottom-1 h-px origin-right scale-x-0 bg-paper transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:origin-left group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
          <SoundToggle />
        </div>

        <button
          type="button"
          className="mono -mr-3 inline-flex h-11 items-center px-3 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-0 top-14 z-40 flex flex-col justify-between bg-ink-900 px-[var(--gutter)] pb-10 pt-8 md:hidden"
      >
        <ul className="flex flex-col gap-2">
          {navItems.map((item, i) => (
            <li key={item.href} className="border-b border-line">
              <Link href={item.href} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-5">
                <span className="text-5xl font-semibold tracking-tight">{item.label}</span>
                <span className="mono text-muted-2">0{i + 1}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between">
          <a href={site.github} className="mono text-paper-dim" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <SoundToggle />
        </div>
      </div>
    </header>
  );
}
