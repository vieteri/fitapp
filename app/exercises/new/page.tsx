"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Legs",
  "Arms",
  "Core",
  "Full Body",
  "Cardio",
] as const;

export default function NewExercisePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const exercise = {
      name: formData.get('name') as string,
      muscle_group: formData.get('muscle_group') as string,
      description: formData.get('description') as string,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('exercises')
        .insert([exercise]);

      if (error) throw error;
      router.push('/exercises');
    } catch (err: any) {
      console.error('Error adding exercise:', err);
      setError(err?.message || 'Failed to add exercise. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // or a loading state
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Exercise</h1>
        <p className="text-sm text-muted-foreground">
          Create a new exercise to add to your workouts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Exercise Name</Label>
          <Input
            name="name"
            required
            placeholder="e.g., Bench Press"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="muscle_group">Muscle Group</Label>
          <Select name="muscle_group" required>
            <SelectTrigger>
              <SelectValue placeholder="Select muscle group" />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.map((group) => (
                <SelectItem key={group} value={group.toLowerCase()}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe the exercise and proper form..."
            className="h-32"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Exercise'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/exercises')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
} 