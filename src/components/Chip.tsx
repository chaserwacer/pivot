import { cn } from "@/lib/cn";

export function Chip({
  children,
  active = false,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs",
        active
          ? "border-accent bg-accent/10 text-accent-fg"
          : "border-ink-100 bg-white text-ink-700",
        className,
      )}
    >
      {children}
    </span>
  );
}
