import { seedRoutes } from "@/lib/mockData";
import { RouteCard } from "@/components/RouteCard";
import { Chip } from "@/components/Chip";
import { SearchBar } from "@/components/SearchBar";

const activities = ["all", "hike", "run", "bike", "ski", "climb"] as const;

export default function DiscoverPage({ searchParams }: { searchParams: { activity?: string } }) {
  const active = (searchParams.activity ?? "all") as (typeof activities)[number];
  const list = active === "all" ? seedRoutes : seedRoutes.filter((r) => r.activity === active);

  return (
    <div className="px-5 pt-4 md:pt-8">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Discover</h1>
      <p className="mt-1 text-sm text-ink-500">Curated routes around you.</p>

      <div className="mt-4">
        <SearchBar />
      </div>

      <div className="no-scrollbar mt-4 -mx-5 flex gap-2 overflow-x-auto px-5">
        {activities.map((a) => (
          <a key={a} href={`/routes?activity=${a}`} className="shrink-0">
            <Chip active={a === active}><span className="capitalize">{a}</span></Chip>
          </a>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <RouteCard key={r.id} route={r} variant="row" />
        ))}
      </div>
    </div>
  );
}
