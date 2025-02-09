'use client';

import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";

export default function WorkoutsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <ErrorState
          title="Failed to load workouts"
          message="We couldn't load your workouts. Please try again or contact support if the problem persists."
          retry={reset}
        />
      </Card>
    </div>
  );
} 