import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded", className)} />;
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-borderLight overflow-hidden", className)}>
      <Skeleton className="aspect-[5/3] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function SkeletonDashboardCard() {
  return (
    <div className="rounded-xl border border-borderLight p-5 space-y-4">
      <Skeleton className="h-5 w-5 rounded" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function SkeletonPetCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-borderLight">
      <Skeleton className="aspect-[5/3] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function SkeletonVaxRow() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-borderLight p-5">
      <Skeleton className="h-5 w-5 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonPredictionCard() {
  return (
    <div className="rounded-md border border-borderLight p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-1 pt-1">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-borderLight py-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === 0 ? "w-32" : "flex-1")} />
      ))}
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonDashboardCard,
  SkeletonPetCard,
  SkeletonVaxRow,
  SkeletonPredictionCard,
  SkeletonText,
  SkeletonTableRow,
};
