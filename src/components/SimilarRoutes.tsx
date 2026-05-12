import { seedRoutes } from "@/lib/mockData";
import { RouteCard } from "./RouteCard";

/**
 * Server-rendered "similar routes" — same activity, closest by distance.
 * Iteration 2+ can expand this to a vector-similarity match on Pivot's
 * own embeddings (segment composition + tags + popularity).
 */
export function SimilarRoutes({ routeId }: { routeId: string }) {
  const subject = seedRoutes.find((r) => r.id === routeId);
  if (!subject) return null;
  const others = seedRoutes
    .filter((r) => r.id !== subject.id && r.activity === subject.activity)
    .map((r) => ({
      r,
      d: Math.abs(r.distance_m - subject.distance_m) + Math.abs(r.ascent_m - subject.ascent_m),
    }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map(({ r }) => r);

  if (others.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-card">
        Nothing similar yet.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {others.map((r) => (
        <li key={r.id}>
          <RouteCard route={r} variant="row" />
        </li>
      ))}
    </ul>
  );
}
