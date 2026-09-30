export type Experiment = {
  name: string;
  kind: string;
  description: string;
  href?: string;
  year: string;
};

const gh = (repo: string) => `https://github.com/maximilianfeix/${repo}`;

export const experiments: Experiment[] = [
  {
    name: "Mini-Laravel",
    kind: "PHP · Framework",
    year: "2026",
    description: "Router, DI container, controllers and middleware – a Laravel-style framework from scratch.",
    href: gh("Mini-Laravel"),
  },
  {
    name: "Self-building profile",
    kind: "Python · CI",
    year: "2026",
    description: "A GitHub profile that renders its own cards with live numbers every three hours.",
    href: gh("maximilianfeix"),
  },
  {
    name: "free-proxy-list",
    kind: "Data · Automation",
    year: "2026",
    description: "The hourly proxy list as JSON and CSV per country, in a repository of its own.",
    href: gh("free-proxy-list"),
  },
  {
    name: "Particle field",
    kind: "GLSL · WebGL",
    year: "2026",
    description: "The drifting network behind this site: GPU-animated points that answer to the cursor.",
    href: gh("maximilianfeix.github.io"),
  },
  {
    name: "CurrentlyFreeDomains",
    kind: "Data · Domains",
    year: "2026",
    description: "A running list of four-letter .de domains that are free to register right now.",
    href: gh("CurrentlyFreeDomains"),
  },
  {
    name: "homebrew-tap",
    kind: "Ruby · Packaging",
    year: "2026",
    description: "Homebrew formulae – `brew install maximilianfeix/tap/spillage`.",
    href: gh("homebrew-tap"),
  },
  {
    name: "C++ for macOS",
    kind: "C++ · Template",
    year: "2025",
    description: "A starter template with VS Code build, run and debug tasks for clang on macOS.",
    href: gh("C--Template-fr-Mac"),
  },
  {
    name: "Vocational school C++",
    kind: "C++ · Learning",
    year: "2026",
    description: "Exercises from the application-development apprenticeship.",
    href: gh("Berufsschule-Anwendungsentwicklung-C-"),
  },
];
