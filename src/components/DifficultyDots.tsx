import type { Difficulty } from "@/lib/types";

const labels: Record<Difficulty, string> = {
  1: "Easy",
  2: "Moderate",
  3: "Hard",
  4: "Strenuous",
  5: "Expert",
};

export function DifficultyDots({
  level,
  className,
  accent = "#0EA5A4",
  showLabel = false,
}: {
  level: Difficulty;
  className?: string;
  accent?: string;
  showLabel?: boolean;
}) {
  return (
    <span
      className={className}
      role="img"
      aria-label={`Difficulty ${level} of 5 — ${labels[level]}`}
    >
      <span aria-hidden className="inline-flex gap-0.5 align-middle">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: i <= level ? accent : "#E6E9EC" }}
          />
        ))}
      </span>
      {showLabel && (
        <span className="ml-2 text-[11px] text-ink-500">{labels[level]}</span>
      )}
    </span>
  );
}
