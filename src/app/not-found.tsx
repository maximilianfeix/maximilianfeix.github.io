import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-svh flex-col justify-end px-[var(--gutter)] pb-[12vh]">
      <p className="mono text-muted-2">Error 404 · Node not found</p>
      <h1 className="display mt-6 text-[length:var(--text-display)]">LOST</h1>
      <p className="mt-8 max-w-md text-xl text-muted">This part of the network doesn&apos;t exist – or it moved.</p>
      <Link
        href="/"
        className="mono mt-10 inline-flex w-fit border-b border-line-strong pb-1 hover:border-accent hover:text-accent"
        data-cursor="view"
      >
        ← Back to MAXI
      </Link>
    </main>
  );
}
