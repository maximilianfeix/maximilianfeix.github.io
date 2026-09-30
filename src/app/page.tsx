import { ViewTransition } from "react";
import { Intro } from "@/features/intro/Intro";
import { Hero } from "@/features/hero/Hero";
import { ProjectsSection } from "@/features/canvas/ProjectsSection";
import { Sequence } from "@/features/sequence/Sequence";
import { Lab } from "@/features/lab/Lab";
import { About } from "@/features/about/About";
import { OpenSource } from "@/features/github/OpenSource";
import { Contact } from "@/features/contact/Contact";
import { Footer } from "@/components/layout/Footer";
import { getGitHubData } from "@/lib/github";
import { pageTransition } from "@/lib/animation/transitions";

export default async function Home() {
  const github = await getGitHubData();
  return (
    <ViewTransition {...pageTransition}>
      <div>
        <main id="main" tabIndex={-1} className="outline-none">
          <Intro />
          <Hero />
          <ProjectsSection />
          <Sequence />
          <Lab />
          <About />
          <OpenSource data={github} />
          <Contact />
        </main>
        <Footer />
      </div>
    </ViewTransition>
  );
}
