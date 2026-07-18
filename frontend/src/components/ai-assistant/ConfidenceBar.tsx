import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const COLORS = [
  { threshold: 0, bg: "bg-red-500", text: "text-red-600" },
  { threshold: 0.4, bg: "bg-amber-500", text: "text-amber-600" },
  { threshold: 0.7, bg: "bg-emerald-500", text: "text-emerald-600" },
];

function getColor(value: number) {
  for (let i = COLORS.length - 1; i >= 0; i--) {
    if (value >= COLORS[i].threshold) return COLORS[i];
  }
  return COLORS[0];
}

function ConfidenceBar({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) {
  const [animWidth, setAnimWidth] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAnimWidth(value)));
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const pct = Math.round(Math.min(animWidth, 1) * 100);
  const color = getColor(value);
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-semibold tracking-wide",
            size === "sm" ? "text-[11px]" : "text-xs",
            "text-textSecondary",
          )}
        >
          Confidence Score
        </span>
        <span
          className={cn(
            "font-bold tabular-nums",
            color.text,
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {Math.round(Math.min(value, 1) * 100)}%
        </span>
      </div>
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-gray-100",
          heights[size],
        )}
        role="progressbar"
        aria-valuenow={Math.round(Math.min(value, 1) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(Math.min(value, 1) * 100)}% confidence`}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", color.bg)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export { ConfidenceBar };
