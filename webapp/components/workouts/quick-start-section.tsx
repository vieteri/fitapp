'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";

function QuickStartContent() {
  const router = useRouter();

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
      <Button onClick={() => router.push('/workouts/new')}>
        <Plus className="h-4 w-4 mr-2" />
        Empty Workout
      </Button>
    </Card>
  );
}

export function QuickStartSection() {
  return (
    <ErrorBoundary>
      <QuickStartContent />
    </ErrorBoundary>
  );
} 