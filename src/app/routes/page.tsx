import Link from "next/link";
import { seedRoutes } from "@/lib/mockData";
import { RouteCard } from "@/components/RouteCard";
import { Chip } from "@/components/Chip";
import { SearchBar } from "@/components/SearchBar";

const activities = ["all", "hike", "run", "bike", "ski", "climb"] as const;
const PAGE_SIZE = 6;

export default function DiscoverPage({
  searchParams,
}: {
  searchParams: { activity?: string; page?: string };
}) {
  const active = (searchParams.activity ?? "all") as (typeof activities)[number];
  const filtered = active === "all" ? seedRoutes : seedRoutes.filter((r) => r.activity === active);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = clamp(parseInt(searchParams.page ?? "1", 10) || 1, 1, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const list = filtered.slice(start, start + PAGE_SIZE);

  const baseHref = active === "all" ? "/routes" : `/routes?activity=${active}`;
  const pageHref = (p: number) =>
    active === "all" ? `/routes?page=${p}` : `/routes?activity=${active}&page=${p}`;

  return (
    <div className="px-5 pt-4 md:pt-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Discover</h1>
        <Link href="/routes/map" className="text-sm text-accent">Map view →</Link>
      </div>
      <p className="mt-1 text-sm text-ink-500">Curated routes around you.</p>

      <div className="mt-4">
        <SearchBar />
      </div>

      <div className="no-scrollbar mt-4 -mx-5 flex gap-2 overflow-x-auto px-5">
        {activities.map((a) => (
          <a key={a} href={a === "all" ? "/routes" : `/routes?activity=${a}`} className="shrink-0">
            <Chip active={a === active}><span className="capitalize">{a}</span></Chip>
          </a>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-6 text-center shadow-card">
          <p className="text-sm font-semibold">No routes here</p>
          <p className="mt-1 text-xs text-ink-500">
            Try a different activity or{" "}
            <Link href="/routes/new?ai=1" className="text-accent">
              ask the AI
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => (
              <RouteCard key={r.id} route={r} variant="row" />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-6 flex items-center justify-between text-sm"
            >
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="text-accent">
                  ‹ Previous
                </Link>
              ) : (
                <span aria-hidden />
              )}
              <span className="text-ink-500">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="text-accent">
                  Next ›
                </Link>
              ) : (
                <span aria-hidden />
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
