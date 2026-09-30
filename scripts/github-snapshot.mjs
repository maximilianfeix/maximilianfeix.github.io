// Refreshes src/data/github-fallback.json – the snapshot the build uses when the GitHub API is unavailable.
// Usage: GITHUB_TOKEN=... node scripts/github-snapshot.mjs
import { writeFileSync } from "node:fs";

const user = "maximilianfeix";
const headers = {
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};
const get = async (p) => {
  const r = await fetch(`https://api.github.com${p}`, { headers });
  if (!r.ok) throw new Error(`${p}: ${r.status}`);
  return r.json();
};

const all = await get(`/users/${user}/repos?per_page=100&sort=pushed`);
const own = all.filter((r) => !r.fork && !r.archived && r.name !== user);
const bytes = new Map();
for (const r of own) for (const [n, b] of Object.entries(await get(`/repos/${user}/${r.name}/languages`))) bytes.set(n, (bytes.get(n) ?? 0) + b);
const total = [...bytes.values()].reduce((a, b) => a + b, 0) || 1;
const events = await get(`/users/${user}/events/public?per_page=100`).catch(() => []);
const activity = [];
for (const e of events) {
  const repo = e.repo.name.replace(`${user}/`, ""),
    p = e.payload;
  if (e.type === "ReleaseEvent" && p.release)
    activity.push({ kind: "release", repo, title: `Released ${p.release.tag_name}`, url: p.release.html_url, date: e.created_at });
  else if (e.type === "PullRequestEvent" && (p.action === "merged" || (p.action === "closed" && p.pull_request?.merged))) {
    // Event payloads are trimmed: the title needs the pull request itself.
    const pr = p.pull_request?.title ? p.pull_request : await get(p.pull_request.url.replace("https://api.github.com", "")).catch(() => null);
    if (pr) activity.push({ kind: "pr", repo, title: pr.title, url: pr.html_url, date: e.created_at });
  }
  if (activity.length >= 6) break;
}
const data = {
  repos: own
    .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
    .map((r) => ({
      name: r.name,
      description: r.description ?? "",
      url: r.html_url,
      homepage: r.homepage ?? "",
      language: r.language ?? "",
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
      topics: r.topics ?? [],
    })),
  languages: [...bytes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, b]) => ({ name, share: b / total })),
  totalStars: own.reduce((s, r) => s + r.stargazers_count, 0),
  publicRepos: own.length,
  activity,
  fetchedAt: new Date().toISOString(),
};
writeFileSync("src/data/github-fallback.json", JSON.stringify(data, null, 2) + "\n");
console.log(`${data.repos.length} repos, ${data.totalStars} stars, ${data.activity.length} activity items`);
