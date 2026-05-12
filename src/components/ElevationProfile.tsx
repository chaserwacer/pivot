import { cn } from "@/lib/cn";

interface Props {
  samples: number[];
  className?: string;
  /** Height in px; width fills container. */
  height?: number;
  showAxes?: boolean;
  accent?: string;
}

/**
 * Pure-SVG elevation profile. No client JS, renders fine on server.
 * The line is the upper edge of a soft gradient fill — the same shape
 * you'd see in AllTrails / Strava but lighter-weight visually.
 */
export function ElevationProfile({ samples, className, height = 96, showAxes = false, accent = "#0EA5A4" }: Props) {
  if (samples.length === 0) return null;
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const range = Math.max(max - min, 1);
  const W = 600; // viewBox width — scales to fit
  const H = 100;
  const stepX = W / (samples.length - 1);
  const points = samples.map((v, i) => {
    const x = i * stepX;
    const y = H - ((v - min) / range) * (H - 8) - 4;
    return [x, y] as const;
  });
  const line = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const gradId = `pf-${Math.abs(hash(samples.join(","))).toString(36)}`;
  return (
    <svg
      className={cn("block w-full", className)}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={accent} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      {showAxes && (
        <g>
          <text x="2" y="12" fontSize="10" fill="#5B6772">{Math.round(max)} m</text>
          <text x="2" y={H - 4} fontSize="10" fill="#5B6772">{Math.round(min)} m</text>
        </g>
      )}
    </svg>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
