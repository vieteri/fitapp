import { supabase } from './setup';

export async function createTestUser() {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  const { data, error } = await supabase.auth.signUp(testUser);
  if (error) throw error;

  return { user: data.user, credentials: testUser };
}

export async function loginTestUser(credentials: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) throw error;
  return data.user;
}

export async function createTestExercise(userId: string) {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      name: 'Test Exercise',
      description: 'Test exercise description',
      muscle_group: 'chest',
      equipment: 'barbell',
      user_id: userId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createTestWorkout(userId: string, exerciseId: string) {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      name: 'Test Workout',
      description: 'Test workout description',
      user_id: userId,
      exercises: [{
        exercise_id: exerciseId,
        sets: 3,
        reps: 10,
        weight: 50
      }]
    })
    .select()
    .single();

  if (error) throw error;
  return data;
} 