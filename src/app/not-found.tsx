import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-5 pt-10 text-center">
      <h1 className="text-xl font-semibold tracking-tight">No trail here.</h1>
      <p className="mt-2 text-sm text-ink-500">
        We couldn't find that page. It may have been moved or never existed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-2xl bg-accent px-4 py-2 text-sm text-white shadow-card"
      >
        Back to home
      </Link>
    </div>
  );
}
