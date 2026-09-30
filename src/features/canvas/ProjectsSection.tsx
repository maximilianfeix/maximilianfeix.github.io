"use client";

import { useMedia } from "@/hooks/useMedia";
import { Universe } from "./Universe";
import { MobileProjects } from "./MobileProjects";

/** The free canvas needs a precise pointer and room; everything else gets the guided gallery. */
export function ProjectsSection() {
  const guided = useMedia("(max-width: 767px), (hover: none)");
  return guided ? <MobileProjects /> : <Universe />;
}
