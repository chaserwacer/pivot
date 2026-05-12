import type { Activity } from "@/lib/types";

const glyph: Record<Activity, string> = {
  hike: "M4 19h2l3-6 3 4 3-8 2 4 3-2",
  run: "M5 20l4-3 2-5 4 2 4-4",
  bike: "M5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7-2L9 9l4-2 3 5",
  ski: "M4 19l16-6M7 18l3-3M12 16l3-3",
  climb: "M5 21V8l4-3 6 4-3 4 4 5",
};

export function ActivityGlyph({ activity, className }: { activity: Activity; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={glyph[activity]} />
    </svg>
  );
}
