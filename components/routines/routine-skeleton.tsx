import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function RoutineSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <Card className="p-6 mb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </Card>

      <div className="space-y-4">
        {[1].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <Skeleton className="h-4 w-40 mt-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 