export function metresToMiles(m: number) {
  return m / 1609.344;
}

export function metresToFeet(m: number) {
  return m * 3.28084;
}

export function formatDistance(m: number, units: "imperial" | "metric" = "imperial") {
  if (units === "imperial") return `${metresToMiles(m).toFixed(1)} mi`;
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

export function formatAscent(m: number, units: "imperial" | "metric" = "imperial") {
  if (units === "imperial") return `${Math.round(metresToFeet(m)).toLocaleString()} ft`;
  return `${Math.round(m).toLocaleString()} m`;
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}
