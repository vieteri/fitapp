'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

export function PageHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Start Workout</h1>
      <Button variant="outline" asChild>
        <Link href="/workouts/history">
          <History className="h-4 w-4 mr-2" />
          History
        </Link>
      </Button>
    </div>
  );
} 