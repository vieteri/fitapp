import { Skeleton } from "@/components/ui/skeleton";

export function ExerciseSkeleton() {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
} 