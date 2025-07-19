'use client';

import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="p-6">
        <ErrorState
          title="Failed to load workout"
          message={
            error.message === 'Workout not found'
              ? "This workout doesn't exist or you don't have permission to view it."
              : "We couldn't load your workout. Please try again or contact support if the problem persists."
          }
          retry={reset}
        />
      </Card>
    </div>
  );
} 