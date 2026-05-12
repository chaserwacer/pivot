import Link from "next/link";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 dark:bg-ink-900/70 border-b border-ink-100/70">
      <div className="flex items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-6 w-6 rounded-full bg-accent" />
          <span className="text-base font-semibold tracking-tight">Pivot</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-ink-500 md:flex">
          <Link href="/routes" className="hover:text-ink-900">Discover</Link>
          <Link href="/routes/new" className="hover:text-ink-900">Build</Link>
          <Link href="/plan" className="hover:text-ink-900">Plan</Link>
          <Link href="/record" className="hover:text-ink-900">Record</Link>
          <Link href="/settings" className="hover:text-ink-900">AI</Link>
        </nav>
      </div>
    </header>
  );
}
