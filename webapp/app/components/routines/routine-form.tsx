"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Routine } from '@/types/supabase-types';

interface RoutineFormProps {
  initialData?: Routine;
  onSuccess: (routine: Routine) => void;
}

export function RoutineForm({ initialData, onSuccess }: RoutineFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(initialData ? `/api/routines/${initialData.id}` : '/api/routines', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });

      if (!response.ok) throw new Error('Failed to save routine');
      const data = await response.json();
      onSuccess(data.routine);
    } catch (error) {
      console.error('Error saving routine:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
} 