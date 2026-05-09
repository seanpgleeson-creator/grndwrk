import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius)] bg-[var(--bg-mute)]",
        className,
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-elev)] p-6 space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--line-2)]">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16 ml-auto" />
    </div>
  );
}
