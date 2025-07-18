"use server"

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/utils/utils";

export const serverSignUp = async (email: string, password: string) => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  return { error: error?.message };
};

export const serverResetPassword = async (email: string) => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  return { error: error?.message };
};

export const serverUpdatePassword = async (password: string) => {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  return { error: error?.message };
};

export async function getWorkouts() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null;

  const { data: workouts } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises (
        *,
        exercise:exercises (*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return workouts;
}

export async function deleteWorkout(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' };
 
  try {
    await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', id);

    await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete workout' };
  }
}

export async function createWorkout(data: {
  name: string;
  description?: string;
  exercises: {
    exercise_id: string;
    reps: number;
    sets?: number;
    weight?: number | null;
    duration_minutes?: number | null;
    order_index?: number;
  }[];
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to create a workout' };

  try {
    // Input validation
    if (!data.name?.trim()) {
      return { error: 'Workout name is required' };
    }

    if (!Array.isArray(data.exercises) || data.exercises.length === 0) {
      return { error: 'At least one exercise is required' };
    }

    // Validate each exercise
    for (let i = 0; i < data.exercises.length; i++) {
      const exercise = data.exercises[i];
      if (!exercise.exercise_id) {
        return { error: `Exercise at position ${i + 1} is missing an ID` };
      }
      if (typeof exercise.reps !== 'number' || exercise.reps <= 0) {
        return { error: `Exercise at position ${i + 1} has invalid reps` };
      }
      if (exercise.sets && (typeof exercise.sets !== 'number' || exercise.sets <= 0)) {
        return { error: `Exercise at position ${i + 1} has invalid sets` };
      }
      if (exercise.weight && typeof exercise.weight !== 'number') {
        return { error: `Exercise at position ${i + 1} has invalid weight` };
      }
      if (exercise.duration_minutes && typeof exercise.duration_minutes !== 'number') {
        return { error: `Exercise at position ${i + 1} has invalid duration` };
      }
    }

    // Start a Supabase transaction
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert([{ 
        name: data.name.trim(), 
        description: data.description?.trim() || null,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (workoutError) {
      console.error('Workout creation error:', workoutError);
      return { error: 'Failed to create workout. Please try again.' };
    }

    if (!workout) {
      return { error: 'Failed to create workout - no workout returned' };
    }

    // Create workout exercises with set numbers
    const workoutExercises = data.exercises.map((exercise) => ({
      workout_id: workout.id,
      exercise_id: exercise.exercise_id,
      sets: exercise.sets || 1,
      reps: exercise.reps,
      weight: exercise.weight || null,
      duration_minutes: exercise.duration_minutes || null
    }));

    const { error: exercisesError } = await supabase
      .from('workout_exercises')
      .insert(workoutExercises);

    if (exercisesError) {
      console.error('Exercise creation error:', exercisesError);
      // Cleanup the workout if exercise creation fails
      await supabase.from('workouts').delete().eq('id', workout.id);
      return { error: exercisesError.message };
    }

    return { 
      success: true, 
      workout: {
        ...workout,
        workout_exercises: workoutExercises
      }
    };
  } catch (error) {
    console.error('Server error creating workout:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    ...data,
    email: user.email
  };
}

export async function getExercise(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('exercises')
    .select(`
      *,
      exercise_muscle_groups (
        muscle_groups (
          id,
          name
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching exercise:', error);
    return null;
  }

  return {
    ...data,
    muscle_groups: data.exercise_muscle_groups.map(
      (emg: any) => emg.muscle_groups.name
    )
  };
}

export async function getExercises() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('exercises')
    .select(`
      *,
      exercise_muscle_groups (
        muscle_groups (
          id,
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('name');

  if (error) {
    console.error('Error fetching exercises:', error);
    return null;
  }

  return data.map((exercise: any) => ({
    ...exercise,
    muscle_groups: exercise.exercise_muscle_groups.map(
      (emg: any) => emg.muscle_groups.name
    )
  }));
}

export async function getRoutine(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: routine, error } = await supabase
    .from('routines')
    .select(`
      *,
      routine_exercises (
        *,
        exercise:exercises (*)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return routine;
}