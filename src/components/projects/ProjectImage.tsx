import { ViewTransition } from "react";
import { imageSrc, imageSrcSet, type Project } from "@/data/projects";

/**
 * A project's image. The same view-transition name on the card and on the project hero lets the browser
 * morph one into the other when the page changes.
 */
export function ProjectImage({
  project,
  sizes,
  priority = false,
  className = "",
  morph = true,
  distort = true,
}: {
  project: Project;
  sizes: string;
  priority?: boolean;
  className?: string;
  morph?: boolean;
  distort?: boolean;
}) {
  const img = (
    <div data-distort={distort ? "" : undefined} className={`relative overflow-hidden bg-ink-800 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export: responsive srcset instead of next/image */}
      <img
        src={imageSrc(project.image, 800)}
        srcSet={imageSrcSet(project.image)}
        sizes={sizes}
        alt={project.imageAlt}
        width={1600}
        height={800}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="h-full w-full select-none object-cover"
      />
    </div>
  );

  if (!morph) return img;
  return (
    <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
      {img}
    </ViewTransition>
  );
}
