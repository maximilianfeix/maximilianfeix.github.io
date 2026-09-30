// The one place to add or change a project. The map node, the card, the project page and the sitemap all read from here.
// Images live in public/projects/<image>-1600.webp and <image>-800.webp.

export type Category = "tool" | "security" | "web" | "infrastructure" | "lab";

export type Project = {
  slug: string;
  name: string;
  /** Short label for the node on the map. */
  node: string;
  year: string;
  role: string;
  category: Category;
  /** One line that sells it. */
  tagline: string;
  description: string;
  longDescription: string[];
  stack: string[];
  tags: string[];
  github?: string;
  website?: string;
  image: string;
  imageAlt: string;
  featured: boolean;
  /** Where the node sits on the map, in map units around MAXI at (0, 0). z pushes it into depth. */
  position: { x: number; y: number; z: number };
  /** Slugs of related projects – drawn as connections on the map. */
  related: string[];
  stats?: { value: string; label: string }[];
  implementation: { title: string; text: string }[];
  challenges: { title: string; text: string }[];
  architecture?: { text: string; code?: { lang: string; source: string } };
  /** Marks entries whose details still need to be filled in. */
  placeholder?: boolean;
};

const gh = (repo: string) => `https://github.com/maximilianfeix/${repo}`;
const pages = (repo: string) => `https://maximilianfeix.github.io/${repo}/`;

export const projects: Project[] = [
  {
    slug: "proxy-scraper",
    name: "Proxy Scraper",
    node: "PROXY SCRAPER",
    year: "2026",
    role: "Author & maintainer",
    category: "tool",
    tagline: "Free proxies that actually work.",
    description:
      "Scrapes HTTP, SOCKS4 and SOCKS5 proxies from 700+ sources and keeps only the ones that pass real checks – re-verified every hour by GitHub Actions.",
    longDescription: [
      "Free proxy lists are mostly noise: dead hosts, honeypots and proxies that quietly inject scripts into the pages they serve – about one in five does. Proxy Scraper collects around a million candidates per run and puts every hit through the same gauntlet: a honeypot filter, content-integrity checks, HTTPS with verified TLS, anonymity, country and provider lookups, and spam blocklists.",
      "It learns with every run which sources are worth scraping, ranks proxies by how likely they are to still be up, and ships the result as a live list, a static website with a page per country, a rotating proxy server, an MCP server for AI agents and a Discord bot.",
    ],
    stack: ["Python", "asyncio", "GitHub Actions", "Prometheus"],
    tags: ["Python", "Networking", "Open Source"],
    github: gh("proxy-scraper"),
    website: pages("proxy-scraper"),
    image: "proxy-scraper",
    imageAlt: "Proxy Scraper: free proxies that actually work – 700+ sources, five checks, a fresh list every hour.",
    featured: true,
    position: { x: -520, y: -250, z: 40 },
    related: ["infrastructure", "spillage", "gha-preview"],
    stats: [
      { value: "700+", label: "sources" },
      { value: "~1M", label: "candidates per run" },
      { value: "25 s", label: "to check them" },
      { value: "750+", label: "tests on 3 OSes" },
    ],
    implementation: [
      {
        title: "An hourly pipeline on free CI",
        text: "A scheduled GitHub Actions workflow scrapes, checks and publishes the list, mirrors it to its own repository, keeps a daily snapshot as a release asset and a Parquet copy on Hugging Face.",
      },
      {
        title: "Checks that catch liars",
        text: "Each proxy fetches a known page; any byte that differs means injected content. TLS is verified end to end, and honeypots are detected by the way they answer requests no real proxy would accept.",
      },
      {
        title: "A server, not just a list",
        text: "A rotating SOCKS5/HTTP proxy server with sticky sessions and Prometheus metrics, plus an MCP server so AI agents can ask for a working proxy by country.",
      },
    ],
    challenges: [
      {
        title: "A million sockets in 25 seconds",
        text: "The checker is fully asynchronous with separate connect and read timeouts, bounded concurrency and early exits, so the run fits comfortably into a CI job.",
      },
      {
        title: "Sources that rot",
        text: "Source statistics are cached between runs; sources that stop delivering fall down the ranking instead of being removed by hand.",
      },
    ],
    architecture: {
      text: "Collect → deduplicate → check in stages, cheapest first → rank → publish. Every stage is a plain function over an async stream, which keeps each one testable against fake proxies on localhost.",
      code: {
        lang: "text",
        source:
          "sources (700+) ─▶ scrape ─▶ dedupe ─▶ connect ─▶ integrity ─▶ TLS ─▶ anonymity ─▶ geo/ASN\n                                                                              │\n        website · JSON/CSV · rotating server · MCP · Discord ◀── rank ◀────────┘",
      },
    },
  },
  {
    slug: "spillage",
    name: "Spillage",
    node: "SPILLAGE",
    year: "2026",
    role: "Author",
    category: "security",
    tagline: "Find the API keys your coding agents spilled into their logs.",
    description:
      "Claude Code, Codex, Gemini CLI, Cursor and the rest keep every conversation on disk as plain text – including each .env they read. Spillage finds the keys, explains how they leaked, and scrubs them.",
    longDescription: [
      "Coding agents log everything: every file they read, every command output, every key pasted in “just to test”. Spillage reads the logs of thirteen agents, tells you which keys leaked and how – you pasted it, a tool printed it, the model repeated it – and links to the page where each one is rotated.",
      "It scrubs the logs without breaking `--resume`, installs hooks that block the next leak, and fits into CI with HTML, JSON, Markdown and SARIF reports, a GitHub Action and a pre-commit hook.",
    ],
    stack: ["Python", "SARIF", "GitHub Actions", "Homebrew"],
    tags: ["Python", "Security", "CLI"],
    github: gh("spillage"),
    website: pages("spillage"),
    image: "spillage",
    imageAlt: "Spillage: your agent wrote your API key down – a log line with a redacted GitHub token.",
    featured: true,
    position: { x: 470, y: -300, z: 80 },
    related: ["actions-guard", "proxy-scraper"],
    stats: [
      { value: "56", label: "detection rules" },
      { value: "13", label: "agents supported" },
      { value: "0", label: "dependencies" },
      { value: "0", label: "network calls" },
    ],
    implementation: [
      {
        title: "Rules that know each key",
        text: "56 rules match the exact shape of each provider's keys. GitHub tokens are checked against their CRC32 checksum, JWTs must decode, and known placeholders are skipped – so reports stay free of noise.",
      },
      {
        title: "Provenance, not just matches",
        text: "Each finding records whether the user typed the key, a tool printed it or the model repeated it – which decides what to fix.",
      },
      {
        title: "Scrubbing that keeps sessions alive",
        text: "Secrets are replaced in place with stable redaction markers, keeping the log format intact so agents can still resume the conversation.",
      },
    ],
    challenges: [
      {
        title: "A tool you point at your secrets",
        text: "Standard library only, no network access, secrets only ever shown masked. Zero dependencies is a security feature here, not a style choice.",
      },
      {
        title: "Thirteen log formats",
        text: "Every agent stores sessions differently – JSONL, SQLite, nested JSON. Each gets a small reader that yields the same event shape.",
      },
    ],
    architecture: {
      text: "Readers turn each agent's storage into one stream of events; rules run over the events; reporters render findings.",
      code: {
        lang: "sh",
        source:
          "brew install maximilianfeix/tap/spillage\nspillage              # scan every agent on this machine\nspillage scrub        # redact in place, --resume keeps working\nspillage --sarif > spillage.sarif",
      },
    },
  },
  {
    slug: "repoatlas",
    name: "RepoAtlas",
    node: "REPOATLAS",
    year: "2026",
    role: "Author",
    category: "tool",
    tagline: "Understand any TypeScript repo in one interactive map.",
    description:
      "Parses every import with the TypeScript compiler API and turns a project into a standalone architecture map – every connection links to the line that proves it.",
    longDescription: [
      "Architecture diagrams drift from the code the day they are drawn. RepoAtlas derives the map from the code itself: the TypeScript compiler API resolves every import, and every edge on the map links to the exact statement and line behind it.",
      "A Focus map shows a module's direct neighbours, an Impact map everything that transitively depends on it, and circular import groups are isolated edge by edge. The output is one HTML file you can share.",
    ],
    stack: ["TypeScript", "Compiler API", "SVG", "Node.js"],
    tags: ["TypeScript", "Visualization", "CLI"],
    github: gh("repoatlas"),
    website: pages("repoatlas"),
    image: "repoatlas",
    imageAlt: "RepoAtlas: an architecture map of Zustand with entry points, modules, dependencies and a verified source line.",
    featured: true,
    position: { x: 80, y: 360, z: 20 },
    related: ["gha-preview", "experiments"],
    stats: [
      { value: "247", label: "modules in the Hono map" },
      { value: "676", label: "connections traced" },
      { value: "1", label: "HTML file to share" },
    ],
    implementation: [
      {
        title: "The compiler as the source of truth",
        text: "Imports are resolved with the same module resolution TypeScript uses, including path aliases and re-exports – no regex guessing.",
      },
      {
        title: "Evidence on every edge",
        text: "Each connection stores file, line and the import text, so any claim on the map can be verified with one click.",
      },
    ],
    challenges: [
      {
        title: "Readable at 600+ edges",
        text: "Layered layout by dependency depth, focus and impact views, and cycle groups pulled out so large graphs stay legible.",
      },
    ],
    architecture: {
      text: "Resolve → build graph → detect cycles (Tarjan) → lay out → render into a single self-contained HTML file.",
      code: {
        lang: "sh",
        source: "npx --yes --package=github:maximilianfeix/repoatlas -- \\\n  repoatlas https://github.com/pmndrs/zustand -o zustand-map.html",
      },
    },
  },
  {
    slug: "actions-guard",
    name: "Actions Guard",
    node: "ACTIONS GUARD",
    year: "2026",
    role: "Author",
    category: "security",
    tagline: "Catch risky workflow changes before they merge.",
    description:
      "A GitHub App that reviews pull requests to .github/workflows and flags the security risks they add – script injection, untrusted checkouts, over-broad permissions.",
    longDescription: [
      "Most supply-chain incidents on GitHub start with a workflow change nobody looked at closely: a `pull_request_target` that checks out the PR's code with secrets in scope, an expression interpolated straight into a shell, a token with write access it never needed.",
      "Actions Guard reviews only the workflow diff of each pull request and reports the risks the change adds – as a check run with annotations on the exact lines, not a wall of pre-existing warnings.",
    ],
    stack: ["TypeScript", "GitHub Apps", "YAML", "Checks API"],
    tags: ["TypeScript", "Security", "GitHub App"],
    github: gh("actions-guard"),
    website: pages("actions-guard"),
    image: "actions-guard",
    imageAlt: "Actions Guard flags an untrusted checkout in a pull_request_target workflow as critical.",
    featured: true,
    position: { x: 700, y: 60, z: -40 },
    related: ["spillage", "gha-preview", "axon-cli"],
    implementation: [
      {
        title: "Diff-aware findings",
        text: "Both versions of each workflow are analysed and only newly introduced risks are reported, so a review stays about the change at hand.",
      },
      {
        title: "Annotations on the line",
        text: "Findings map back to YAML source positions and land as check-run annotations right in the pull request.",
      },
    ],
    challenges: [
      {
        title: "Precision over volume",
        text: "Each rule targets a concrete exploit path – untrusted checkout with secrets, injection through `${{ }}` in `run:` – instead of style advice.",
      },
    ],
  },
  {
    slug: "gha-preview",
    name: "gha-preview",
    node: "GHA PREVIEW",
    year: "2026",
    role: "Author",
    category: "tool",
    tagline: "See the run before the run.",
    description:
      "Paste a GitHub Actions workflow and explore it as a job graph – which jobs a push would start, what a matrix expands to, and how a change reshapes the pipeline.",
    longDescription: [
      "Workflows are graphs written as YAML. gha-preview parses them in the browser and draws the graph: jobs, `needs`, matrix expansion, conditions that decide whether a job runs for a given event.",
      "It is honest about what it can't know – runtime conditions are shown as conditional instead of guessed – and every job links back to its line in the YAML. No account, nothing uploaded.",
    ],
    stack: ["TypeScript", "Vite", "YAML", "SVG"],
    tags: ["TypeScript", "Developer Tools", "Visualization"],
    github: gh("gha-preview"),
    website: pages("gha-preview"),
    image: "gha-preview",
    imageAlt: "gha-preview showing a release workflow as a job map next to its YAML.",
    featured: true,
    position: { x: 420, y: 330, z: -60 },
    related: ["actions-guard", "repoatlas", "axon-cli"],
    implementation: [
      {
        title: "Everything in the browser",
        text: "Parsing, evaluation of `if:` expressions against a chosen event and the graph layout all run client-side – the workflow never leaves the page.",
      },
      { title: "From graph to source", text: "Nodes keep their YAML source ranges, so clicking a job highlights exactly the lines that define it." },
    ],
    challenges: [
      {
        title: "Unknown is a valid answer",
        text: "Expressions that depend on runtime values are marked conditional rather than evaluated with made-up inputs.",
      },
    ],
  },
  {
    slug: "holymeme",
    name: "HolyMeme",
    node: "HOLYMEME",
    year: "2026",
    role: "Author",
    category: "web",
    tagline: "A heavenly real-time multiplayer meme party game.",
    description:
      "Everyone picks a template, writes the funniest caption, and the room reacts with real meme reactions. Built on a WebSocket server written from scratch – zero dependencies.",
    longDescription: [
      "HolyMeme is a party game for friends in the same (virtual) room: create a lobby, share the code, caption a meme template against the clock and vote with reaction images. Whoever collects the most points becomes the Meme Saint.",
      "There is no framework and no npm install. The server implements the WebSocket protocol (RFC 6455) on top of Node's `http` module, with connection limits per IP, idle timeouts, message rate limits, origin checks and strict security headers.",
    ],
    stack: ["Node.js", "WebSockets (RFC 6455)", "Vanilla JS", "CSS"],
    tags: ["Node.js", "Real-time", "Game"],
    image: "holymeme",
    imageAlt: "HolyMeme: an angel emoji with a halo and wings next to the game's name.",
    featured: true,
    position: { x: -620, y: 220, z: 60 },
    related: ["event-system", "experiments"],
    implementation: [
      {
        title: "WebSockets from first principles",
        text: "Handshake, frame parsing, masking, ping/pong and close frames are implemented by hand – with hard caps on frame and buffer size so a single client can't exhaust memory.",
      },
      {
        title: "A server-authoritative game loop",
        text: "Rooms move through lobby, captioning, voting and results on the server; clients only render state, which keeps cheating and desync out.",
      },
    ],
    challenges: [
      {
        title: "Open to the internet, safely",
        text: "Per-IP limits on connections and room creation, idle timeouts, input normalisation and a strict CSP – learned the hard way that party games attract flooders.",
      },
    ],
    architecture: {
      text: "One Node process: an HTTP server for static files and the upgrade, a minimal WebSocket layer, and a GameServer that owns every room's state machine.",
      code: {
        lang: "js",
        source:
          '// RFC 6455: the accept key is the SHA-1 of the client key plus a fixed GUID\nconst accept = crypto\n  .createHash("sha1")\n  .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")\n  .digest("base64");',
      },
    },
  },
  {
    slug: "axon-cli",
    name: "AxonPHP CLI",
    node: "AXON CLI",
    year: "2026",
    role: "Author",
    category: "tool",
    tagline: "CI/CD configuration for PHP projects in one command.",
    description:
      "A tiny PHP command-line tool that reads your project and generates a GitHub Actions workflow for it – installed with Composer, done in a second.",
    longDescription: [
      "Every PHP project needs the same CI scaffolding: check out, set up PHP, install with Composer, run the tests. AxonPHP CLI writes that workflow for you, based on what it finds in the project.",
      "It's deliberately small – a Composer package with one job – and a first step into building developer tooling that saves minutes on every new repository.",
    ],
    stack: ["PHP", "Composer", "GitHub Actions"],
    tags: ["PHP", "CLI", "CI/CD"],
    github: gh("AxonPHPCLI"),
    image: "axon-cli",
    imageAlt: "A terminal running axonphp ci:init github and printing the generated workflow.",
    featured: false,
    position: { x: 20, y: -420, z: -20 },
    related: ["gha-preview", "actions-guard", "experiments"],
    implementation: [
      {
        title: "Composer-native",
        text: "Installed as a dev dependency and run from `vendor/bin`, so it works in any PHP project without a global install.",
      },
    ],
    challenges: [
      {
        title: "Sensible defaults",
        text: "Generate a workflow that is correct for most projects out of the box, and easy to read and adjust afterwards.",
      },
    ],
    architecture: { text: "", code: { lang: "sh", source: "composer require --dev maxim/axonphp-cli\nvendor/bin/axonphp ci:init github" } },
  },
  {
    slug: "event-system",
    name: "Event Registration System",
    node: "EVENT SYSTEM",
    year: "2026",
    role: "Developer",
    category: "web",
    tagline: "Registration, check-in and capacity for events.",
    description: "A web application for running event registrations end to end: sign-ups, capacity limits and check-in on the day.",
    longDescription: [
      "Details for this project are still being written up. The entry exists so the map shows the full picture; the case study will follow.",
    ],
    stack: ["PHP", "MariaDB", "JavaScript"],
    tags: ["Web App", "PHP", "Database"],
    image: "event-system",
    imageAlt: "An abstract seating plan with one highlighted seat and a checked-in ticket.",
    featured: false,
    position: { x: -300, y: 430, z: -30 },
    related: ["holymeme", "infrastructure"],
    implementation: [{ title: "Coming soon", text: "Implementation notes will be added here." }],
    challenges: [{ title: "Coming soon", text: "The interesting problems will be documented here." }],
    placeholder: true,
  },
  {
    slug: "infrastructure",
    name: "Infrastructure",
    node: "INFRASTRUCTURE",
    year: "Since 2025",
    role: "Apprentice developer at a hosting company",
    category: "infrastructure",
    tagline: "The parts users never see.",
    description:
      "APIs, deployment pipelines, database schemas and the automation that keeps all of it running – the day job, at a hosting company in Germany.",
    longDescription: [
      "Most of my working time goes into backend services in Node.js, TypeScript, PHP and Python, with Vue where a UI is needed – and into the ops half of the job: Linux, Apache, Redis, MariaDB, cron and shell glue.",
      "The thread through all of it is automation that removes repetitive work: CI pipelines, scripts and bots. Every change starts as an issue and lands through a reviewed pull request.",
    ],
    stack: ["Linux", "Node.js", "PHP", "Redis", "MariaDB", "Apache"],
    tags: ["Backend", "Ops", "Automation"],
    github: gh("maximilianfeix"),
    image: "infrastructure",
    imageAlt: "An abstract server rack connected to Apache, Node.js, Redis and MariaDB.",
    featured: false,
    position: { x: -760, y: -30, z: -80 },
    related: ["proxy-scraper", "event-system"],
    implementation: [
      {
        title: "From commit to production",
        text: "Local development with Vue and Vite, GitHub Actions for lint, tests and builds, artifacts deployed behind Apache or Node.js, Redis for caches and sessions, MariaDB and MongoDB for data, logs and metrics closing the loop.",
      },
      {
        title: "The right tool for the job",
        text: "Node.js for HTTP APIs and realtime, PHP for classic web apps, Python for CLIs and glue – MariaDB for relational data, Redis for anything hot and short-lived, SQLite when a single file is enough.",
      },
    ],
    challenges: [
      {
        title: "Boring on purpose",
        text: "Infrastructure is good when nobody notices it. Tests that run offline, reviewed changes and scheduled jobs keep it that way.",
      },
    ],
  },
  {
    slug: "experiments",
    name: "Experiments",
    node: "EXPERIMENTS",
    year: "2025 – now",
    role: "Everything",
    category: "lab",
    tagline: "Small things, built to learn.",
    description:
      "A PHP framework from scratch, C++ exercises, a domain watcher, a self-updating GitHub profile and the shaders on this site – the lab where most ideas start.",
    longDescription: [
      "Not everything needs to be a product. The lab is where I take something apart to understand it – a Laravel-style framework rebuilt from its router up, the C++ from vocational school, a GitHub profile that renders its own cards with live numbers every three hours.",
      "The Lab section on the home page lists them all.",
    ],
    stack: ["PHP", "C++", "Python", "GLSL"],
    tags: ["Learning", "Playground", "Open Source"],
    github: gh("maximilianfeix"),
    image: "experiments",
    imageAlt: "A generative field of dots with a few highlighted clusters and a thin wave.",
    featured: false,
    position: { x: 300, y: -40, z: 120 },
    related: ["repoatlas", "holymeme", "axon-cli"],
    implementation: [
      {
        title: "Mini-Laravel",
        text: "Router, dependency-injection container, controllers and middleware – written from scratch to understand what the framework does for you.",
      },
      {
        title: "A profile that builds itself",
        text: "A scheduled workflow renders the profile banner and project cards with live data, text shaped with HarfBuzz so it looks the same everywhere.",
      },
    ],
    challenges: [
      { title: "Finishing small things", text: "The rule in the lab: every experiment gets a README and a commit history someone else can follow." },
    ],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

export function adjacentProjects(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return { prev: projects[(i - 1 + projects.length) % projects.length], next: projects[(i + 1) % projects.length] };
}

export const imageSrc = (image: string, size: 800 | 1600 = 1600) => `/projects/${image}-${size}.webp`;
export const imageSrcSet = (image: string) => `/projects/${image}-800.webp 800w, /projects/${image}-1600.webp 1600w`;
