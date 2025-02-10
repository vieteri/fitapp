import { NotFound } from "@/components/ui/not-found";
import { Plus } from "lucide-react";

export default function ExerciseNotFound() {
  return (
    <NotFound
      title="Exercise not found"
      description="This exercise doesn't exist or has been removed."
      variant="section"
      action={{
        label: "Create Exercise",
        href: "/exercises/new",
        icon: <Plus className="h-4 w-4 mr-2" />
      }}
    />
  );
} 