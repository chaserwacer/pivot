import { seedRoutes } from "@/lib/mockData";
import { RoutesMap } from "@/components/RoutesMap";

export default function RoutesMapPage() {
  return (
    <div className="px-5 pt-4 md:pt-8">
      <a href="/routes" className="text-sm text-ink-500">‹ Back to list</a>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">All routes</h1>
      <p className="mt-1 text-sm text-ink-500">
        Tap a marker to open the route. Coloured by activity.
      </p>
      <RoutesMap routes={seedRoutes} className="mt-4 h-[60vh] w-full rounded-2xl bg-ink-100" />
    </div>
  );
}
