function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200 ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

function AIAssistantSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-44" />
        </div>
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>

      <div className="rounded-xl border border-borderLight bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-56" />
          </div>
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
      </div>

      <Skeleton className="h-28 w-full rounded-xl" />

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-borderLight bg-white p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading analysis...</span>
    </div>
  );
}

export { AIAssistantSkeleton };
