export function RecentWorkoutsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-1/4 bg-muted animate-pulse rounded" />
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
              <div className="flex gap-2">
                {[1, 2].map((j) => (
                  <div key={j} className="h-8 w-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 