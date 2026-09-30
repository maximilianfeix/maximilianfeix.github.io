import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { adjacentProjects, imageSrc, projectBySlug, projects } from "@/data/projects";
import { ProjectImage } from "@/components/projects/ProjectImage";
import { ScrollMockup } from "@/components/projects/ScrollMockup";
import { TitleReveal } from "@/components/projects/TitleReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Footer } from "@/components/layout/Footer";
import { pageTransition } from "@/lib/animation/transitions";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  const url = `/projects/${p.slug}/`;
  return {
    title: p.name,
    description: p.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${p.name} – ${p.tagline}`,
      description: p.description,
      images: [{ url: imageSrc(p.image), width: 1600, height: 800, alt: p.imageAlt }],
    },
    twitter: { card: "summary_large_image", title: `${p.name} – ${p.tagline}`, description: p.description, images: [imageSrc(p.image)] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();
  const index = projects.indexOf(p);
  const { next } = adjacentProjects(p.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": p.github ? "SoftwareSourceCode" : "CreativeWork",
    name: p.name,
    description: p.description,
    url: `${site.url}/projects/${p.slug}/`,
    image: `${site.url}${imageSrc(p.image)}`,
    author: { "@type": "Person", name: site.name, url: site.url },
    ...(p.github ? { codeRepository: p.github, programmingLanguage: p.stack[0] } : {}),
    keywords: p.tags.join(", "),
  };

  return (
    <ViewTransition {...pageTransition}>
      <div>
        <main id="main" tabIndex={-1} className="outline-none">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

          {/* Hero */}
          <header className="px-[var(--gutter)] pt-[calc(var(--nav-h)+3rem)]">
            <div className="mono flex flex-wrap items-center justify-between gap-4 text-muted-2">
              <Link
                href="/#projects"
                transitionTypes={["nav-back"]}
                className="group inline-flex items-center gap-2 py-2 text-paper-dim hover:text-paper"
                data-cursor="view"
                data-cursor-label="BACK"
              >
                <span className="transition-transform duration-500 group-hover:-translate-x-1">←</span> Back to the graph
              </Link>
              <span className="tabular-nums">
                <span className="text-paper">{String(index + 1).padStart(2, "0")}</span> / {String(projects.length).padStart(2, "0")} · {p.category}
              </span>
            </div>

            <TitleReveal text={p.name} className="display mt-12 text-[clamp(3.4rem,11vw,11rem)]" />
            <p className="mt-8 max-w-3xl text-[clamp(1.3rem,2.6vw,2.4rem)] font-medium leading-tight tracking-tight text-muted">{p.tagline}</p>
          </header>

          <div className="mt-16 px-[var(--gutter)]">
            <ProjectImage project={p} sizes="100vw" priority className="aspect-[2/1] max-h-[82svh] w-full border border-line" />
          </div>

          <Reveal>
            {/* Facts */}
            <dl className="grid grid-cols-2 gap-x-8 gap-y-10 px-[var(--gutter)] pt-16 md:grid-cols-4">
              <div data-reveal>
                <dt className="mono text-muted-2">Year</dt>
                <dd className="mt-3 text-lg">{p.year}</dd>
              </div>
              <div data-reveal>
                <dt className="mono text-muted-2">Role</dt>
                <dd className="mt-3 text-lg">{p.role}</dd>
              </div>
              <div data-reveal>
                <dt className="mono text-muted-2">Stack</dt>
                <dd className="mt-3 text-lg leading-snug">{p.stack.join(", ")}</dd>
              </div>
              <div data-reveal>
                <dt className="mono text-muted-2">Links</dt>
                <dd className="mt-3 flex flex-col gap-1 text-lg">
                  {p.website && (
                    <a href={p.website} target="_blank" rel="noreferrer" className="hover:text-accent" data-cursor="view">
                      Live site ↗
                    </a>
                  )}
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noreferrer" className="hover:text-accent" data-cursor="view">
                      Source on GitHub ↗
                    </a>
                  )}
                  {!p.website && !p.github && <span className="text-muted">Private</span>}
                </dd>
              </div>
            </dl>

            {/* Overview */}
            <section aria-labelledby="overview" className="grid gap-8 px-[var(--gutter)] py-32 md:grid-cols-12">
              <h2 id="overview" data-reveal className="mono text-muted-2 md:col-span-3">
                Overview
              </h2>
              <div className="space-y-8 md:col-span-8">
                <p data-reveal className="text-[clamp(1.4rem,2.4vw,2.2rem)] font-medium leading-snug tracking-tight">
                  {p.description}
                </p>
                {p.longDescription.map((para) => (
                  <p key={para.slice(0, 24)} data-reveal className="max-w-2xl text-lg leading-relaxed text-paper-dim">
                    {para}
                  </p>
                ))}
                {p.placeholder && (
                  <p data-reveal className="mono border-l border-accent pl-4 text-muted">
                    Case study in progress.
                  </p>
                )}
              </div>
            </section>

            {p.stats && (
              <section aria-label="In numbers" className="px-[var(--gutter)]">
                <div data-reveal="line" className="h-px bg-line-strong" />
                <dl className="grid grid-cols-2 gap-y-12 py-16 md:grid-cols-4">
                  {p.stats.map((s) => (
                    <div key={s.label} data-reveal>
                      <dd className="text-[clamp(3rem,6vw,6rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums">{s.value}</dd>
                      <dt className="mono mt-4 text-muted-2">{s.label}</dt>
                    </div>
                  ))}
                </dl>
                <div data-reveal="line" className="h-px bg-line" />
              </section>
            )}

            {/* Implementation: the mockup holds still while the notes scroll past */}
            <section aria-labelledby="implementation" className="grid gap-16 px-[var(--gutter)] py-32 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="lg:sticky lg:top-[20vh]">
                  <ScrollMockup project={p} />
                </div>
              </div>
              <div className="lg:col-span-5">
                <h2 id="implementation" data-reveal className="mono text-muted-2">
                  Implementation
                </h2>
                <ol className="mt-8 space-y-14">
                  {p.implementation.map((item, i) => (
                    <li key={item.title} data-reveal>
                      <p className="mono text-muted-2">{String(i + 1).padStart(2, "0")}</p>
                      <h3 className="mt-3 text-2xl font-medium tracking-tight">{item.title}</h3>
                      <p className="mt-3 leading-relaxed text-paper-dim">{item.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* Challenges */}
            <section aria-labelledby="challenges" className="grid gap-8 px-[var(--gutter)] py-24 md:grid-cols-12">
              <h2 id="challenges" data-reveal className="mono text-muted-2 md:col-span-3">
                Technical challenges
              </h2>
              <ul className="md:col-span-9">
                {p.challenges.map((c) => (
                  <li key={c.title} data-reveal className="grid gap-4 border-t border-line py-8 md:grid-cols-9">
                    <h3 className="text-xl font-medium tracking-tight md:col-span-4">{c.title}</h3>
                    <p className="leading-relaxed text-muted md:col-span-5">{c.text}</p>
                  </li>
                ))}
              </ul>
            </section>

            {p.architecture && (
              <section aria-labelledby="architecture" className="grid gap-8 px-[var(--gutter)] py-24 md:grid-cols-12">
                <h2 id="architecture" data-reveal className="mono text-muted-2 md:col-span-3">
                  Architecture
                </h2>
                <div className="md:col-span-9">
                  {p.architecture.text && (
                    <p data-reveal className="max-w-2xl text-lg leading-relaxed text-paper-dim">
                      {p.architecture.text}
                    </p>
                  )}
                  {p.architecture.code && (
                    <figure data-reveal className="mt-10 border border-line bg-ink-950/70">
                      <figcaption className="mono flex justify-between border-b border-line px-5 py-3 text-muted-2">
                        <span>{p.architecture.code.lang}</span>
                        <span>{p.slug}</span>
                      </figcaption>
                      <pre className="overflow-x-auto p-5 font-mono text-[0.8rem] leading-relaxed text-paper-dim" tabIndex={0}>
                        <code>{p.architecture.code.source}</code>
                      </pre>
                    </figure>
                  )}
                </div>
              </section>
            )}
          </Reveal>

          {/* Next project */}
          <nav aria-label="Next project" className="mt-24 border-t border-line px-[var(--gutter)] pb-24 pt-16">
            <Link
              href={`/projects/${next.slug}/`}
              transitionTypes={["project-open"]}
              className="group grid items-end gap-10 md:grid-cols-12"
              data-cursor="open"
            >
              <div className="md:col-span-7">
                <p className="mono text-muted-2">Next project</p>
                <p className="display mt-6 text-[clamp(3rem,9vw,9rem)] transition-colors duration-500 group-hover:text-accent">{next.name}</p>
                <p className="mt-6 max-w-md text-lg text-muted">{next.tagline}</p>
              </div>
              <div className="md:col-span-5">
                <ProjectImage
                  project={next}
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="aspect-[2/1] border border-line transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
                />
              </div>
            </Link>
          </nav>
        </main>
        <Footer />
      </div>
    </ViewTransition>
  );
}
