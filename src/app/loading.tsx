export default function Loading() {
  return (
    <div className="px-5 pt-6" aria-busy="true" aria-live="polite">
      <div className="h-7 w-40 animate-pulse rounded-md bg-ink-100" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-ink-100" />
      <div className="mt-6 h-14 w-full animate-pulse rounded-2xl bg-ink-100" />
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink-100" />
        ))}
      </div>
    </div>
  );
}
