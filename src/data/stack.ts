// The technology constellation in the About section. `projects` are slugs from projects.ts.
export type Tech = { name: string; group: "language" | "runtime" | "data" | "ops" | "web"; projects: string[] };

export const technologies: Tech[] = [
  { name: "TypeScript", group: "language", projects: ["repoatlas", "actions-guard", "gha-preview"] },
  { name: "Python", group: "language", projects: ["proxy-scraper", "spillage", "experiments"] },
  { name: "PHP", group: "language", projects: ["axon-cli", "event-system", "infrastructure", "experiments"] },
  { name: "Java", group: "language", projects: [] },
  { name: "C++", group: "language", projects: ["experiments"] },
  { name: "Node.js", group: "runtime", projects: ["holymeme", "infrastructure", "repoatlas"] },
  { name: "Vue", group: "web", projects: ["infrastructure"] },
  { name: "Next.js", group: "web", projects: [] },
  { name: "Three.js", group: "web", projects: ["experiments"] },
  { name: "WebSockets", group: "web", projects: ["holymeme"] },
  { name: "Redis", group: "data", projects: ["infrastructure"] },
  { name: "MariaDB", group: "data", projects: ["infrastructure", "event-system"] },
  { name: "SQLite", group: "data", projects: ["spillage"] },
  { name: "Linux", group: "ops", projects: ["infrastructure", "proxy-scraper"] },
  { name: "Docker", group: "ops", projects: ["infrastructure"] },
  { name: "GitHub Actions", group: "ops", projects: ["proxy-scraper", "actions-guard", "gha-preview", "axon-cli"] },
  { name: "Prometheus", group: "ops", projects: ["proxy-scraper"] },
];
