# The Internet of Maxi

The portfolio of Maximilian Feix – **[maximilianfeix.github.io](https://maximilianfeix.github.io)**.

A small digital universe instead of a template: a cinematic intro, a hero that folds into depth as you scroll, a draggable
map of projects wired together like a network, and project pages you *enter* rather than open.

## Stack

Next.js (static export) · TypeScript · Tailwind CSS · GSAP + ScrollTrigger · Lenis · Three.js / React Three Fiber · Zustand

## Develop

```sh
npm install
npm run dev      # http://localhost:3000
npm run check    # typecheck, lint and a production build – the same as CI
```

## Adding a project

Everything about a project lives in [`src/data/projects.ts`](src/data/projects.ts). Add an entry there and put its images
in `public/projects/` as `<slug>-1600.webp` and `<slug>-800.webp` – the node on the map, the card, the project page and the
sitemap all come from that one entry.

`scripts/assets/` holds the sources and scripts for the project images (`node scripts/assets/convert.mjs`,
`node scripts/assets/art.mjs`).

## Structure

```
src/
  app/            routes, metadata, sitemap, robots
  components/     layout, ui primitives, WebGL, project components
  features/       the big interactive pieces: intro, hero, canvas, cursor, sequence, lab, about, github, contact, sound
  lib/            motion config, shaders, performance helpers, GitHub data
  data/           projects, experiments, technologies
  hooks/ store/   shared hooks and the global UI state
```

## Accessibility and performance

Every interaction works with a keyboard, and `prefers-reduced-motion` turns off parallax, camera travel and shaders.
WebGL is loaded lazily, paused when the tab is hidden, and runs at a lower resolution on weaker devices; phones get a
guided layout instead of the free canvas.

## Deploy

Every push to `main` is typechecked, linted, built and published to GitHub Pages by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). A daily run keeps the GitHub numbers fresh.
