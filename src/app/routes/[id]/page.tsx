import { notFound } from "next/navigation";
import { getRoute, mockWeather } from "@/lib/mockData";
import { ElevationProfile } from "@/components/ElevationProfile";
import { MapView } from "@/components/MapView";
import { Chip } from "@/components/Chip";
import { ActivityGlyph } from "@/components/ActivityGlyph";
import { DownloadButton } from "@/components/DownloadButton";
import { Conditions } from "@/components/Conditions";
import { formatAscent, formatDistance, formatDuration } from "@/lib/units";

export default function RouteDetail({ params }: { params: { id: string } }) {
  const route = getRoute(params.id);
  if (!route) notFound();

  return (
    <div className="pb-10">
      <div className="px-5 pt-4 md:pt-8">
        <a href="/routes" className="text-sm text-ink-500">‹ Back</a>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{route.title}</h1>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-500">
          <ActivityGlyph activity={route.activity} className="h-4 w-4" />
          <span className="capitalize">{route.activity}</span> · {route.summary}
        </p>
      </div>

      <div className="mt-4 px-5">
        <MapView
          className="h-56 md:h-72"
          accent={route.thumbnail_color}
          bbox={route.bbox}
          line={sampleLineFromBbox(route.bbox)}
        />
      </div>

      <div className="mx-5 mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-4 shadow-card">
        <Stat label="Distance" value={formatDistance(route.distance_m)} />
        <Stat label="Ascent" value={formatAscent(route.ascent_m)} />
        <Stat label="Time" value={formatDuration(route.estimated_time_s)} />
      </div>

      <section className="mt-6 px-5">
        <h2 className="mb-2 text-sm font-semibold">Elevation</h2>
        <div className="rounded-2xl bg-white p-3 shadow-card">
          <ElevationProfile samples={route.elevation} height={120} showAxes accent={route.thumbnail_color} />
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-2 text-sm font-semibold">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {route.tags.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-2 text-sm font-semibold">Today's weather</h2>
        <div className="rounded-2xl bg-white p-4 text-sm shadow-card">
          <p className="text-ink-700">{mockWeather.summary}</p>
          <p className="mt-1 text-xs text-ink-500">
            {mockWeather.temp_c}°C · feels {mockWeather.feels_like_c}°C · wind {mockWeather.wind_kph} km/h
          </p>
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-2 text-sm font-semibold">Recent conditions</h2>
        <Conditions routeId={route.id} />
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-2 text-sm font-semibold">Export & save</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <a className="rounded-full border border-ink-100 bg-white px-3 py-1.5" href={`/api/routes/${route.id}/export?format=gpx`}>GPX</a>
          <a className="rounded-full border border-ink-100 bg-white px-3 py-1.5" href={`/api/routes/${route.id}/export?format=kml`}>KML</a>
          <a className="rounded-full border border-ink-100 bg-white px-3 py-1.5" href={`/api/routes/${route.id}/export?format=fit`}>FIT</a>
          <a className="rounded-full border border-ink-100 bg-white px-3 py-1.5" href={`/api/strava/connect?route=${route.id}`}>Send to Strava</a>
          <DownloadButton route={route} />
        </div>
      </section>

      <div className="sticky bottom-20 mx-5 mt-8 md:bottom-6">
        <button className="w-full rounded-2xl bg-accent py-3 text-white shadow-card transition active:scale-[0.99]">
          Start route
        </button>
      </div>
    </div>
  );
}

// Stand-in line geometry until iteration 1 wires Valhalla; tracks a smooth
// curve across the route's bounding box so the map has something to draw.
function sampleLineFromBbox(
  bbox: [number, number, number, number],
): Array<[number, number]> {
  const [w, s, e, n] = bbox;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const lng = w + (e - w) * t;
    const lat = s + (n - s) * (0.5 + 0.45 * Math.sin(t * Math.PI));
    pts.push([lng, lat]);
  }
  return pts;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-base font-semibold">{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-ink-500">{label}</span>
    </div>
  );
}
