import { type LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-borderLight py-16 px-6 text-center",
        className,
      )}
    >
      <Icon className="h-10 w-10 text-textSecondary/50" strokeWidth={1.5} />
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
