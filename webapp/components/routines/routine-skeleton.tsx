import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function RoutineSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-1">
          <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
          <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
        </div>

        {/* Details Skeleton */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="h-6 w-1/4 bg-muted animate-pulse rounded mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-2/3 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Exercises Skeleton */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="h-6 w-1/4 bg-muted animate-pulse rounded mb-4" />
            <div className="divide-y">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
                      <div className="flex items-center gap-4">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="h-4 w-16 bg-muted animate-pulse rounded" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-4 w-full bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 