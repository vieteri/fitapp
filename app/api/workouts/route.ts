import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';


export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Generate a default name if not provided
    const workoutName = body.name || `Workout ${new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`;

    // Create workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        name: workoutName,
        description: body.description,
        user_id: user.id,
      })
      .select()
      .single();

    if (workoutError) {
      console.error('Error creating workout:', workoutError);
      return NextResponse.json(
        { error: 'Failed to create workout' },
        { status: 500 }
      );
    }

    // Create workout exercises if provided
    if (body.exercises?.length > 0) {
      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(
          body.exercises.map((ex: {
            exercise_id: string;
            reps: number;
            sets: number;
            weight?: number;
            duration_minutes?: number;
          }) => ({
            workout_id: workout.id,
            exercise_id: ex.exercise_id,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight || null,
            duration_minutes: ex.duration_minutes || null
          }))
        );

      if (exercisesError) {
        console.error('Error creating workout exercises:', exercisesError);
        // Delete the workout since exercise creation failed
        await supabase.from('workouts').delete().eq('id', workout.id);
        return NextResponse.json(
          { error: 'Failed to create workout exercises' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ workout });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get limit from URL params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '0');

    let query = supabase
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

    // Apply limit if provided
    if (limit > 0) {
      query = query.limit(limit);
    }

    const { data: workouts, error } = await query;

    if (error) {
      console.error('Error fetching workouts:', error);
      return NextResponse.json(
        { error: 'Error fetching workouts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error('Workouts route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 