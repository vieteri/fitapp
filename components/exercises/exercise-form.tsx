'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from '@/types/supabase-types';

type Exercise = Omit<Tables<'exercises'>, 'muscle_group'> & {
  muscle_groups: string[];
};

interface ExerciseFormProps {
  initialValues?: Partial<Exercise>;
  onSubmit?: (data: Partial<Exercise>) => Promise<void>;
  onCancel?: () => void;
}

export function ExerciseForm({ initialValues, onSubmit, onCancel }: ExerciseFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Exercise>>({
    name: '',
    muscle_groups: [],
    description: '',
    ...initialValues
  });

  const muscleGroups = [
    "Chest",
    "Back",
    "Shoulders",
    "Legs",
    "Arms",
    "Core",
    "Full Body",
    "Cardio"
  ];

  const availableMuscleGroups = muscleGroups.filter(
    group => !formData.muscle_groups?.includes(group)
  );

  const handleAddMuscleGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      muscle_groups: [...(prev.muscle_groups || []), group]
    }));
  };

  const handleRemoveMuscleGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      muscle_groups: prev.muscle_groups?.filter(g => g !== group) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.muscle_groups?.length) {
      alert('Please select at least one muscle group');
      return;
    }
    setSaving(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else if (initialValues?.id) {
        const response = await fetch(`/api/exercises/${initialValues.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to update exercise');
        
        router.push('/exercises');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert('Failed to save exercise');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Exercise name"
          />
        </div>

        <div className="space-y-2">
          <Label>Muscle Groups</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.muscle_groups?.map(group => (
              <Badge key={group} variant="secondary">
                {group}
                <button
                  type="button"
                  onClick={() => handleRemoveMuscleGroup(group)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Select
            value=""
            onValueChange={handleAddMuscleGroup}
            disabled={availableMuscleGroups.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add muscle group" />
            </SelectTrigger>
            <SelectContent>
              {availableMuscleGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Exercise description"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
} 