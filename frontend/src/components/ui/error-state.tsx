import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center",
        className,
      )}
    >
      <AlertCircle className="h-8 w-8 text-red-500" />
      <div>
        <p className="text-sm font-medium text-red-800">Something went wrong</p>
        <p className="mt-1 text-sm text-red-600">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}

export { ErrorState };
