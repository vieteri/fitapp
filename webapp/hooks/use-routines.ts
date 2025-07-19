import { useState, useEffect } from 'react';
import type { Routine } from '@/types/supabase-types';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await fetch('/api/routines');
        if (!response.ok) throw new Error('Failed to fetch routines');
        const data = await response.json();
        setRoutines(data.routines);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  return { routines, isLoading, error };
} 