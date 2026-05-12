import { cn } from "@/lib/cn";

/**
 * Placeholder for a real MapLibre canvas. We render a stylised topo-like
 * SVG so the surrounding UI can be designed and reviewed without a tile
 * provider. Iteration 1 replaces this with the real map.
 */
export function MapPreview({ className, accent = "#0EA5A4" }: { className?: string; accent?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-100 to-ink-50", className)}>
      <svg viewBox="0 0 400 240" className="h-full w-full" aria-hidden>
        {/* contour lines */}
        {[0.2, 0.35, 0.5, 0.65, 0.8].map((t, i) => (
          <path
            key={i}
            d={`M0,${240 * t} C 80,${240 * (t - 0.05)} 160,${240 * (t + 0.05)} 240,${240 * (t - 0.04)} S 400,${240 * (t + 0.03)} 400,${240 * t}`}
            stroke="#A7B0B8"
            strokeOpacity={0.5}
            strokeWidth={1}
            fill="none"
          />
        ))}
        {/* trail */}
        <path
          d="M30 200 C 90 180, 120 120, 180 130 S 260 90, 300 60 S 360 70, 380 40"
          stroke={accent}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="30" cy="200" r="5" fill={accent} />
        <circle cx="380" cy="40" r="5" fill={accent} />
      </svg>
      <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-white/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-500 backdrop-blur">
        Preview
      </div>
    </div>
  );
}
