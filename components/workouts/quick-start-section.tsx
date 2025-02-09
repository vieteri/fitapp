'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function QuickStartSection() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  async function handleStartEmptyWorkout(e: React.FormEvent) {
    e.preventDefault();
    if (isCreating) return;

    try {
      setIsCreating(true);
      const response = await fetch('/api/workouts', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create workout');
      }

      router.push(`/workouts/${data.workout.id}`);
    } catch (error) {
      console.error('Error creating workout:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create workout');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
      <form onSubmit={handleStartEmptyWorkout}>
        <Button type="submit" disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? 'Creating...' : 'Empty Workout'}
        </Button>
      </form>
    </Card>
  );
} 