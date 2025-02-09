import { Skeleton } from "@/components/ui/skeleton";

export function WorkoutsSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="mt-4 space-y-2">
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 