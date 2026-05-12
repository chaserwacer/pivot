import type { Route, WeatherSnapshot } from "./types";

/**
 * Six seed routes around Aspen, CO with realistic-feeling stats.
 * Polylines are placeholders; the map preview renders the elevation
 * profile rather than the line itself in the MVP scaffold.
 */
export const seedRoutes: Route[] = [
  {
    id: "maroon-bells-scenic",
    title: "Maroon Bells Scenic Loop",
    activity: "hike",
    distance_m: 13_530,
    ascent_m: 396,
    difficulty: 2,
    estimated_time_s: 4 * 3600,
    polyline: "",
    elevation: profile(2870, 3266, 60, "wave"),
    summary: "Iconic alpine views, lakes, and groves of aspen.",
    tags: ["Scenic", "Family", "Lake"],
    bbox: [-106.99, 39.07, -106.93, 39.11],
    popularity: 98,
    source: "pivot",
    thumbnail_color: "#1F6FB2",
  },
  {
    id: "smuggler-mountain-out-back",
    title: "Smuggler Mountain Out & Back",
    activity: "hike",
    distance_m: 9_820,
    ascent_m: 396,
    difficulty: 2,
    estimated_time_s: 2 * 3600 + 30 * 60,
    polyline: "",
    elevation: profile(2440, 2854, 50, "ramp"),
    summary: "Quick local favourite with overlook over Aspen town.",
    tags: ["Local", "Sunrise"],
    bbox: [-106.81, 39.18, -106.78, 39.21],
    popularity: 92,
    source: "pivot",
    thumbnail_color: "#0EA5A4",
  },
  {
    id: "hunter-creek-cascade",
    title: "Hunter Creek Cascade",
    activity: "run",
    distance_m: 17_700,
    ascent_m: 671,
    difficulty: 3,
    estimated_time_s: 2 * 3600 + 10 * 60,
    polyline: "",
    elevation: profile(2440, 3010, 80, "ramp"),
    summary: "Shaded valley run, creek-side most of the way.",
    tags: ["Water", "Forest", "Trail Run"],
    bbox: [-106.83, 39.19, -106.78, 39.24],
    popularity: 71,
    source: "pivot",
    thumbnail_color: "#2B7A4B",
  },
  {
    id: "rio-grande-trail",
    title: "Rio Grande Trail to Woody Creek",
    activity: "bike",
    distance_m: 19_310,
    ascent_m: 122,
    difficulty: 1,
    estimated_time_s: 1 * 3600 + 30 * 60,
    polyline: "",
    elevation: profile(2400, 2530, 80, "flat"),
    summary: "Mellow paved-and-gravel rail trail along the Roaring Fork.",
    tags: ["Family", "Paved", "River"],
    bbox: [-106.92, 39.18, -106.79, 39.22],
    popularity: 88,
    source: "pivot",
    thumbnail_color: "#A56B2C",
  },
  {
    id: "lost-man-loop",
    title: "Lost Man Loop",
    activity: "hike",
    distance_m: 14_000,
    ascent_m: 853,
    difficulty: 4,
    estimated_time_s: 6 * 3600,
    polyline: "",
    elevation: profile(3170, 3850, 80, "wave"),
    summary: "Above-treeline tundra, two passes, two lakes.",
    tags: ["Alpine", "Tundra", "Long Day"],
    bbox: [-106.7, 39.13, -106.6, 39.18],
    popularity: 64,
    source: "pivot",
    thumbnail_color: "#5C4B8A",
  },
  {
    id: "ajax-skin-track",
    title: "Ajax Skin Track",
    activity: "ski",
    distance_m: 5_100,
    ascent_m: 945,
    difficulty: 4,
    estimated_time_s: 2 * 3600 + 30 * 60,
    polyline: "",
    elevation: profile(2440, 3380, 40, "ramp"),
    summary: "Uphill ski route on Aspen Mountain — early-morning window.",
    tags: ["Uphill", "Winter"],
    bbox: [-106.84, 39.18, -106.81, 39.2],
    popularity: 47,
    source: "pivot",
    thumbnail_color: "#3068B0",
  },
];

export function getRoute(id: string): Route | undefined {
  return seedRoutes.find((r) => r.id === id);
}

export const mockWeather: WeatherSnapshot = {
  temp_c: 7,
  feels_like_c: 4,
  precip_mm: 0.4,
  wind_kph: 14,
  condition: "partly_cloudy",
  summary: "Light snow easing by 10am, sun by noon.",
  sunrise: "2026-05-12T05:54:00-06:00",
  sunset: "2026-05-12T20:08:00-06:00",
  alerts: [],
};

/**
 * Deterministic elevation generator so cards always render the same line.
 * shape: 'wave' = symmetric climb-then-descend; 'ramp' = monotonic up;
 * 'flat' = small wobble around the floor.
 */
function profile(low: number, high: number, samples: number, shape: "wave" | "ramp" | "flat"): number[] {
  const out: number[] = [];
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    let h: number;
    if (shape === "wave") {
      h = low + (high - low) * Math.sin(t * Math.PI);
    } else if (shape === "ramp") {
      h = low + (high - low) * t;
    } else {
      h = low + (high - low) * 0.1 * Math.sin(t * Math.PI * 4);
    }
    // small deterministic wobble
    h += Math.sin(i * 1.7) * (high - low) * 0.02;
    out.push(Math.round(h));
  }
  return out;
}
