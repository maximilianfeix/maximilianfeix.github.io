import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line px-[var(--gutter)] py-8">
      <div className="mono flex flex-col gap-4 text-muted-2 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span className="hidden md:inline">{site.location}</span>
        <span className="flex gap-6">
          <Link href="/#top" className="hover:text-paper" data-cursor="view">
            Back to top ↑
          </Link>
          <a href={`${site.github}/maximilianfeix.github.io`} target="_blank" rel="noreferrer" className="hover:text-paper" data-cursor="view">
            Source ↗
          </a>
        </span>
      </div>
    </footer>
  );
}
