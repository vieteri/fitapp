import { NotFound } from "@/components/ui/not-found";
import { Plus } from "lucide-react";

export default function WorkoutNotFound() {
  return (
    <NotFound
      title="Workout not found"
      description="This workout doesn't exist or you don't have permission to view it."
      variant="section"
      action={{
        label: "Start New Workout",
        href: "/workouts/new",
        icon: <Plus className="h-4 w-4 mr-2" />
      }}
    />
  );
} 