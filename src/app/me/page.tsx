import { seedRoutes } from "@/lib/mockData";
import { RouteCard } from "@/components/RouteCard";

export default function MePage() {
  const saved = seedRoutes.slice(0, 3);
  return (
    <div className="px-5 pt-4 md:pt-8">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">You</h1>
      <p className="mt-1 text-sm text-ink-500">Saved routes and downloads.</p>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Saved</h2>
        <ul className="flex flex-col gap-2">
          {saved.map((r) => (
            <li key={r.id}>
              <RouteCard route={r} variant="row" />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-4 text-sm shadow-card">
        <p className="font-semibold">Connected accounts</p>
        <ul className="mt-2 space-y-2 text-ink-700">
          <li className="flex items-center justify-between">Strava <a className="text-accent" href="/api/strava/connect">Connect</a></li>
          <li className="flex items-center justify-between">AllTrails <span className="text-ink-300">GPX import</span></li>
          <li className="flex items-center justify-between">Gaia GPS <span className="text-ink-300">GPX import</span></li>
        </ul>
      </section>
    </div>
  );
}
