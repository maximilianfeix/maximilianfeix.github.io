import type { GitHubData } from "@/lib/github";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/lib/site";

const fmt = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const shades = ["bg-paper", "bg-paper-dim", "bg-muted", "bg-muted-2", "bg-ink-600", "bg-accent", "bg-line-strong"];

/** GitHub, as part of the portfolio rather than a copy of GitHub's UI. Rendered at build time. */
export function OpenSource({ data }: { data: GitHubData }) {
  const repos = data.repos.slice(0, 8);
  const top = data.languages[0];

  return (
    <section id="open-source" aria-labelledby="oss-title" className="relative px-[var(--gutter)] py-32 md:py-40">
      <Reveal>
        <div className="grid gap-6 md:grid-cols-12">
          <p data-reveal className="mono text-muted-2 md:col-span-3">
            06 — Open source
          </p>
          <h2 id="oss-title" data-reveal className="text-[clamp(2.4rem,6vw,6rem)] font-semibold leading-[0.9] tracking-[-0.04em] md:col-span-9">
            Built in public.
            <br />
            <span className="text-muted">Tested, reviewed, released.</span>
          </h2>
        </div>

        <dl className="mt-20 grid grid-cols-2 gap-y-10 border-t border-line pt-10 md:grid-cols-4">
          {[
            { k: "Public repositories", v: String(data.publicRepos) },
            { k: "Stars", v: String(data.totalStars) },
            { k: "Main language", v: top ? top.name : "—" },
            { k: "Share of code", v: top ? `${Math.round(top.share * 100)}%` : "—" },
          ].map((s) => (
            <div key={s.k} data-reveal>
              <dt className="mono text-muted-2">{s.k}</dt>
              <dd className="mt-3 text-[clamp(2.2rem,4vw,3.6rem)] font-medium leading-none tracking-tight tabular-nums">{s.v}</dd>
            </div>
          ))}
        </dl>

        {/* Languages as one bar, sized by bytes of code across all repositories. */}
        <div data-reveal className="mt-14">
          <div
            className="flex h-2 w-full gap-[2px] overflow-hidden"
            role="img"
            aria-label={data.languages.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(", ")}
          >
            {data.languages.map((l, i) => (
              <span key={l.name} className={`${shades[i % shades.length]} h-full`} style={{ width: `${l.share * 100}%` }} />
            ))}
          </div>
          <ul className="mono mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.62rem] text-muted">
            {data.languages.map((l, i) => (
              <li key={l.name} className="flex items-center gap-2">
                <span className={`h-2 w-2 ${shades[i % shades.length]}`} />
                {l.name} <span className="text-muted-2">{(l.share * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-24 grid gap-16 lg:grid-cols-12">
          {/* Repositories as nodes on one line */}
          <ol className="relative lg:col-span-8" aria-label="Repositories">
            <span aria-hidden className="absolute bottom-3 left-[5px] top-3 w-px bg-line" />
            {repos.map((r) => (
              <li key={r.name} data-reveal className="relative pl-10">
                <span aria-hidden className="absolute left-0 top-[1.9rem] h-[11px] w-[11px] rounded-full border border-line-strong bg-ink-900" />
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="view"
                  className="group grid gap-2 border-b border-line py-6 md:grid-cols-[1fr_auto] md:gap-8"
                >
                  <div>
                    <p className="text-2xl font-medium tracking-tight transition-colors group-hover:text-accent">{r.name}</p>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{r.description}</p>
                  </div>
                  <div className="mono flex gap-6 text-[0.62rem] text-muted-2 md:flex-col md:items-end md:gap-1">
                    <span>{r.language || "—"}</span>
                    <span className="tabular-nums">★ {r.stars}</span>
                    <span>{fmt.format(new Date(r.pushedAt))}</span>
                  </div>
                </a>
              </li>
            ))}
          </ol>

          <div className="lg:col-span-4">
            <p data-reveal className="mono text-muted-2">
              Recently shipped
            </p>
            <ul className="mt-6 space-y-6">
              {data.activity.map((a) => (
                <li key={a.url} data-reveal>
                  <a href={a.url} target="_blank" rel="noreferrer" className="group block" data-cursor="view">
                    <p className="mono text-[0.62rem] text-muted-2">
                      {a.kind === "release" ? "Released" : "Merged"} · {a.repo} · {fmt.format(new Date(a.date))}
                    </p>
                    <p className="mt-1 leading-snug text-paper-dim transition-colors group-hover:text-paper">{a.title}</p>
                  </a>
                </li>
              ))}
            </ul>
            <a
              data-reveal
              href={site.github}
              target="_blank"
              rel="noreferrer"
              data-cursor="view"
              className="mono mt-12 inline-flex border-b border-line-strong pb-1 text-paper transition-colors hover:border-accent hover:text-accent"
            >
              All repositories on GitHub ↗
            </a>
            <p className="mono mt-4 text-[0.6rem] text-muted-2">Numbers from {fmt.format(new Date(data.fetchedAt))}, refreshed daily.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
