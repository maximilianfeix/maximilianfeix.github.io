"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Magnetic } from "@/components/ui/Magnetic";
import { useReducedMotion } from "@/hooks/useMedia";
import { site } from "@/lib/site";

const lines = ["LET’S", "BUILD", "SOMETHING."];

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const primary = site.email ? { href: `mailto:${site.email}`, label: "Write me" } : { href: site.github, label: "Say hello" };
  const links = [
    { label: "GitHub", href: site.github, note: "@" + site.githubUser },
    ...(site.email ? [{ label: "Email", href: `mailto:${site.email}`, note: site.email }] : []),
    ...(site.linkedin ? [{ label: "LinkedIn", href: site.linkedin, note: "Profile" }] : []),
    { label: "Source", href: `${site.github}/maximilianfeix.github.io`, note: "of this site" },
  ];

  // The three lines slide in from alternating sides as the section arrives.
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-line]").forEach((line, i) => {
        gsap.fromTo(
          line,
          { xPercent: i % 2 ? 12 : -12 },
          { xPercent: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 20%", scrub: true } },
        );
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={root}
      id="contact"
      tabIndex={-1}
      aria-labelledby="contact-title"
      className="relative overflow-hidden px-[var(--gutter)] pb-16 pt-32 outline-none md:pt-48"
    >
      <p className="mono text-muted-2">07 — Contact</p>
      <h2 id="contact-title" className="display mt-8 text-[clamp(3.6rem,13vw,13rem)]" aria-label="Let's build something.">
        {lines.map((l, i) => (
          <span key={l} data-line aria-hidden className={`block ${i === 1 ? "text-muted" : ""} ${i === 2 ? "md:pl-[12vw]" : ""}`}>
            {l}
          </span>
        ))}
      </h2>

      <div className="mt-20 grid items-end gap-16 md:grid-cols-12">
        <ul className="md:col-span-7">
          {links.map((l) => (
            <li key={l.label} className="border-t border-line last:border-b">
              <a
                href={l.href}
                target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                data-cursor="view"
                className="group flex items-baseline justify-between gap-6 py-5"
              >
                <span className="text-3xl font-medium tracking-tight transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-3 md:text-4xl">
                  {l.label}
                </span>
                <span className="mono text-muted-2 transition-colors group-hover:text-paper">
                  {l.note} <span className="text-accent">↗</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="flex justify-center md:col-span-5 md:justify-end">
          <Magnetic strength={0.4} radius={180}>
            <a
              href={primary.href}
              target={primary.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              data-cursor="view"
              data-cursor-label="HELLO"
              className="group relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full bg-paper text-ink-900 md:h-56 md:w-56"
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-0" />
              <span className="relative text-lg font-semibold tracking-tight">{primary.label} →</span>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
