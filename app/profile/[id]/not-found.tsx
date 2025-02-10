import { NotFound } from "@/components/ui/not-found";

export default function ProfileNotFound() {
  return (
    <NotFound
      title="Profile not found"
      description="This user profile doesn't exist or you don't have permission to view it."
      variant="section"
    />
  );
} 