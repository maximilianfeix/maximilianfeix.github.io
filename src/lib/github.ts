import "server-only";
import fallback from "@/data/github-fallback.json";
import { site } from "@/lib/site";

export type Repo = {
  name: string;
  description: string;
  url: string;
  homepage: string;
  language: string;
  stars: number;
  pushedAt: string;
  topics: string[];
};

export type Activity = { kind: "release" | "pr" | "push" | "create"; repo: string; title: string; url: string; date: string };

export type GitHubData = {
  repos: Repo[];
  languages: { name: string; share: number }[];
  totalStars: number;
  publicRepos: number;
  activity: Activity[];
  fetchedAt: string;
};

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, { headers, cache: "force-cache" });
  if (!res.ok) throw new Error(`GitHub ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

type ApiRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  languages_url: string;
};
type ApiEvent = { type: string; repo: { name: string }; created_at: string; payload: Record<string, unknown> };

/**
 * Public GitHub data, fetched once at build time. The site is static, so a failed request must never fail the build:
 * it falls back to the snapshot in github-fallback.json.
 */
export async function getGitHubData(): Promise<GitHubData> {
  try {
    const user = site.githubUser;
    const all = await get<ApiRepo[]>(`/users/${user}/repos?per_page=100&sort=pushed`);
    const own = all.filter((r) => !r.fork && !r.archived && r.name !== user);

    const langBytes = new Map<string, number>();
    await Promise.all(
      own.map(async (r) => {
        const langs = await get<Record<string, number>>(`/repos/${user}/${r.name}/languages`).catch(() => ({}));
        for (const [name, bytes] of Object.entries(langs)) langBytes.set(name, (langBytes.get(name) ?? 0) + bytes);
      }),
    );
    const total = [...langBytes.values()].reduce((a, b) => a + b, 0) || 1;
    const languages = [...langBytes.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, bytes]) => ({ name, share: bytes / total }));

    const repos: Repo[] = own
      .sort((a, b) => b.stargazers_count - a.stargazers_count || +new Date(b.pushed_at) - +new Date(a.pushed_at))
      .map((r) => ({
        name: r.name,
        description: r.description ?? "",
        url: r.html_url,
        homepage: r.homepage ?? "",
        language: r.language ?? "",
        stars: r.stargazers_count,
        pushedAt: r.pushed_at,
        topics: r.topics ?? [],
      }));

    const events = await get<ApiEvent[]>(`/users/${user}/events/public?per_page=100`).catch(() => [] as ApiEvent[]);
    const activity: Activity[] = [];
    for (const e of events) {
      const repo = e.repo.name.replace(`${user}/`, "");
      const p = e.payload as {
        action?: string;
        pull_request?: { url: string; title?: string; html_url?: string; merged?: boolean };
        release?: { tag_name: string; html_url: string };
      };
      if (e.type === "ReleaseEvent" && p.release) {
        activity.push({ kind: "release", repo, title: `Released ${p.release.tag_name}`, url: p.release.html_url, date: e.created_at });
      } else if (e.type === "PullRequestEvent" && p.pull_request && (p.action === "merged" || (p.action === "closed" && p.pull_request.merged))) {
        // Event payloads are trimmed: the title needs the pull request itself.
        const pr = p.pull_request.title
          ? (p.pull_request as { title: string; html_url: string })
          : await get<{ title: string; html_url: string }>(p.pull_request.url.replace("https://api.github.com", "")).catch(() => null);
        if (pr) activity.push({ kind: "pr", repo, title: pr.title, url: pr.html_url, date: e.created_at });
      }
      if (activity.length >= 6) break;
    }

    return {
      repos,
      languages,
      totalStars: own.reduce((s, r) => s + r.stargazers_count, 0),
      publicRepos: own.length,
      activity: activity.length ? activity : (fallback as GitHubData).activity,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("[github] using the fallback snapshot:", (err as Error).message);
    return fallback as GitHubData;
  }
}
