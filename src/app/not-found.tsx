import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative z-10 flex min-h-[calc(100vh-var(--header-height))] items-center justify-center pt-[var(--header-height)]">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.1em] text-[var(--brand-accent)]">
          404
        </p>
        <h1 className="mt-4 text-[clamp(32px,5vw,48px)] font-semibold tracking-[-0.03em]">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--text-muted)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--brand)]/90"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
