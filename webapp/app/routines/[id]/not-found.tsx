import { NotFound } from "@/components/ui/not-found";

export default function RoutineNotFound() {
  return (
    <NotFound
      title="Routine not found"
      description="This routine doesn't exist or you don't have permission to view it."
      variant="section"
    />
  );
} 