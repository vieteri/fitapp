import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileSkeletonProps {
  type?: 'full' | 'workouts' | 'routines';
}

export function ProfileSkeleton({ type = 'full' }: ProfileSkeletonProps) {
  if (type === 'workouts') {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-36" /> {/* Title */}
          <Skeleton className="h-9 w-[70px]" /> {/* View All button */}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Skeleton className="h-4 w-4" /> {/* Icon */}
              </div>
              <div>
                <Skeleton className="h-5 w-32" /> {/* Workout name */}
                <Skeleton className="h-4 w-24 mt-1" /> {/* Exercise count */}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (type === 'routines') {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-36" /> {/* Title */}
          <Skeleton className="h-9 w-[70px]" /> {/* View All button */}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Skeleton className="h-4 w-4" /> {/* Icon */}
              </div>
              <div>
                <Skeleton className="h-5 w-32" /> {/* Routine name */}
                <Skeleton className="h-4 w-24 mt-1" /> {/* Exercise count */}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Full profile skeleton
  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Skeleton className="h-8 w-8" /> {/* Avatar */}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" /> {/* Name */}
                <Skeleton className="h-4 w-32" /> {/* Email */}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[100px]" /> {/* Edit Profile button */}
              <Skeleton className="h-9 w-[90px]" /> {/* Sign Out button */}
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <Skeleton className="h-6 w-20" /> {/* Member since */}
            <div className="h-4 w-[1px] bg-border" /> {/* Divider */}
            <Skeleton className="h-6 w-32" /> {/* Last active */}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Skeleton className="h-6 w-6" /> {/* Icon */}
            </div>
            <div>
              <Skeleton className="h-6 w-24" /> {/* Title */}
              <Skeleton className="h-4 w-40 mt-1" /> {/* Stats line 1 */}
              <Skeleton className="h-4 w-32 mt-1" /> {/* Stats line 2 */}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Skeleton className="h-6 w-6" /> {/* Icon */}
            </div>
            <div>
              <Skeleton className="h-6 w-24" /> {/* Title */}
              <Skeleton className="h-4 w-40 mt-1" /> {/* Stats line */}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Workouts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-36" /> {/* Title */}
            <Skeleton className="h-9 w-[70px]" /> {/* View All button */}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Skeleton className="h-4 w-4" /> {/* Icon */}
                </div>
                <div>
                  <Skeleton className="h-5 w-32" /> {/* Workout name */}
                  <Skeleton className="h-4 w-24 mt-1" /> {/* Exercise count */}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Routines */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-36" /> {/* Title */}
            <Skeleton className="h-9 w-[70px]" /> {/* View All button */}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Skeleton className="h-4 w-4" /> {/* Icon */}
                </div>
                <div>
                  <Skeleton className="h-5 w-32" /> {/* Routine name */}
                  <Skeleton className="h-4 w-24 mt-1" /> {/* Exercise count */}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 