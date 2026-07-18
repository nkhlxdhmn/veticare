import { type LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useEffect, useState } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const reduced = useReducedMotion();
  const [showIcon, setShowIcon] = useState(false);
  useEffect(() => { setShowIcon(true); }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-borderLight py-16 px-6 text-center",
        className,
      )}
    >
      <Icon
        className="h-10 w-10 text-textSecondary/50"
        strokeWidth={1.5}
        style={reduced ? {} : {
          opacity: showIcon ? 1 : 0,
          transform: showIcon ? "translateY(0) scale(1)" : "translateY(4px) scale(0.9)",
          transition: "opacity 250ms ease-out, transform 250ms ease-out",
        }}
      />
      <p className="mt-4 text-xl font-medium">{title}</p>
      <p className="mt-2 text-sm text-textSecondary max-w-sm">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-textPrimary px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export { EmptyState };
