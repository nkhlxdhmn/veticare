import { AlertTriangle, Clock, CalendarDays, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG = [
  {
    match: (p: string) => p.toLowerCase().includes("emergency"),
    bg: "bg-red-50 border-red-200 text-red-700",
    icon: AlertTriangle,
    label: "Emergency",
  },
  {
    match: (p: string) => p.toLowerCase().includes("24"),
    bg: "bg-orange-50 border-orange-200 text-orange-700",
    icon: Clock,
    label: "Within 24 hours",
  },
  {
    match: (p: string) => p.toLowerCase().includes("3 days") || p.toLowerCase().includes("3 day"),
    bg: "bg-yellow-50 border-yellow-200 text-yellow-700",
    icon: CalendarDays,
    label: "Within 3 days",
  },
  {
    match: (_p: string) => true,
    bg: "bg-green-50 border-green-200 text-green-700",
    icon: ShieldCheck,
    label: "Monitor at home",
  },
];

function SeverityBadge({
  priority,
  size = "md",
}: {
  priority: string;
  size?: "sm" | "md";
}) {
  const config = PRIORITY_CONFIG.find((c) => c.match(priority)) ?? PRIORITY_CONFIG[PRIORITY_CONFIG.length - 1];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold leading-none",
        config.bg,
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
      )}
      role="status"
      aria-label={`Veterinary priority: ${config.label}`}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export { SeverityBadge };
