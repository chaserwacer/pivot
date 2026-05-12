export type Activity = "hike" | "run" | "bike" | "ski" | "climb";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  title: string;
  activity: Activity;
  /** Distance in metres. UI converts to user units. */
  distance_m: number;
  /** Total ascent in metres. */
  ascent_m: number;
  difficulty: Difficulty;
  /** Estimated moving time in seconds at the activity's nominal pace. */
  estimated_time_s: number;
  /** Encoded polyline (Google algorithm) for compact transport. */
  polyline: string;
  /** Sampled elevation profile in metres (one sample per ~50 m). */
  elevation: number[];
  /** Compact summary used on cards and lists. */
  summary: string;
  /** Free-form tags surfaced as chips. */
  tags: string[];
  /** Bounding box: [west, south, east, north]. */
  bbox: [number, number, number, number];
  popularity: number;
  /** Where the route was sourced from. */
  source: "pivot" | "strava" | "alltrails" | "gaia" | "user";
  thumbnail_color: string;
}

export interface AIPreferences {
  activities: Activity[];
  intensity: 1 | 2 | 3 | 4 | 5;
  crowd_tolerance: 1 | 2 | 3 | 4 | 5;
  surface_pref: Array<"trail" | "gravel" | "paved" | "snow">;
  avoid: Array<"exposure" | "scrambling" | "river_crossing" | "heavy_traffic">;
  use_strava_fitness: boolean;
  use_bookings: boolean;
  use_calendar: boolean;
}

export interface AISuggestRequest {
  prompt?: string;
  activity?: Activity;
  near?: LatLng;
  duration_min?: number;
  start_at?: string; // ISO
}

export interface AISuggestResponse {
  suggestions: Array<{
    route: Route;
    rationale: string;
    warnings?: string[];
  }>;
  /** Echo of the context the server used; useful for debugging in dev. */
  context_summary: string;
}

export interface WeatherSnapshot {
  temp_c: number;
  feels_like_c: number;
  precip_mm: number;
  wind_kph: number;
  condition: "clear" | "partly_cloudy" | "cloudy" | "rain" | "snow" | "storm";
  summary: string;
  sunrise: string; // ISO
  sunset: string; // ISO
  alerts: Array<{ severity: "advisory" | "watch" | "warning"; title: string }>;
}
