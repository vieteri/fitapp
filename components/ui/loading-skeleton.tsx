'use client';

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'form';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ 
  variant = 'card', 
  count = 1,
  className 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <Card className={cn("p-6", className)}>
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        );
      
      case 'list':
        return (
          <div className={cn("space-y-2", className)}>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        );
      
      case 'table':
        return (
          <div className={cn("space-y-4", className)}>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          </div>
        );
      
      case 'form':
        return (
          <div className={cn("space-y-4", className)}>
            <Skeleton className="h-8 w-1/4" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
            <Skeleton className="h-8 w-1/3" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
            <Skeleton className="h-10 w-32" /> {/* Button */}
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="mb-4">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
} 