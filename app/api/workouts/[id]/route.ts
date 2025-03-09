import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // First delete associated workout exercises
    const { error: exercisesError } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', params.id);

    if (exercisesError) throw exercisesError;

    // Then delete the workout
    const { error: workoutError } = await supabase
      .from('workouts')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    if (workoutError) throw workoutError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting workout' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: workout, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercise:exercises (*)
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching workout:', error);
      return NextResponse.json(
        { error: 'Error fetching workout' },
        { status: 500 }
      );
    }

    if (!workout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ workout });
  } catch (error) {
    console.error('Workout fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Check what we're updating
    if (body.exercises !== undefined) {
      // We're updating exercises alongside other details
      const updateData: {
        name?: string;
        description?: string | null;
      } = {};
      
      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      
      // Start a transaction to update both the workout and exercises
      const { data: updatedWorkout, error: workoutError } = await supabase
        .from('workouts')
        .update(updateData)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (workoutError) {
        console.error('Error updating workout:', workoutError);
        return NextResponse.json(
          { error: 'Error updating workout' },
          { status: 500 }
        );
      }
      
      // Get current exercises
      const { data: currentExercises } = await supabase
        .from('workout_exercises')
        .select('id')
        .eq('workout_id', params.id);
        
      const currentExerciseIds = currentExercises?.map(ex => ex.id) || [];
      const newExercises = body.exercises || [];
      const updatedExerciseIds = newExercises
        .filter((ex: any) => ex.id)
        .map((ex: any) => ex.id);
      
      // Find exercises to delete (in current but not in updated)
      const exercisesToDelete = currentExerciseIds.filter(
        id => !updatedExerciseIds.includes(id)
      );
      
      if (exercisesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('workout_exercises')
          .delete()
          .in('id', exercisesToDelete);
          
        if (deleteError) {
          console.error('Error deleting exercises:', deleteError);
          return NextResponse.json(
            { error: 'Error deleting exercises' },
            { status: 500 }
          );
        }
      }
      
      // Process each exercise
      for (const exercise of newExercises) {
        if (exercise.id) {
          // Update existing exercise
          const { error: updateError } = await supabase
            .from('workout_exercises')
            .update({
              exercise_id: exercise.exercise_id,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight
            })
            .eq('id', exercise.id)
            .eq('workout_id', params.id);
            
          if (updateError) {
            console.error('Error updating exercise:', updateError);
            return NextResponse.json(
              { error: 'Error updating exercise' },
              { status: 500 }
            );
          }
        } else {
          // Add new exercise
          const { error: insertError } = await supabase
            .from('workout_exercises')
            .insert({
              workout_id: params.id,
              exercise_id: exercise.exercise_id,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight
            });
            
          if (insertError) {
            console.error('Error adding exercise:', insertError);
            return NextResponse.json(
              { error: 'Error adding exercise' },
              { status: 500 }
            );
          }
        }
      }
      
      // Get the updated workout with exercises
      const { data: workout, error: fetchError } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            exercise:exercises (*)
          )
        `)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching updated workout:', fetchError);
        return NextResponse.json(
          { error: 'Error fetching updated workout' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ workout });
    } else if (body.name !== undefined || body.description !== undefined) {
      // Original workout details update logic
      const updateData: {
        name?: string;
        description?: string | null;
      } = {};
      
      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      
      // Return early if no fields to update
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: 'No valid fields to update' },
          { status: 400 }
        );
      }

      const { data: workout, error } = await supabase
        .from('workouts')
        .update(updateData)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select(`
          *,
          workout_exercises (
            *,
            exercise:exercises (*)
          )
        `)
        .single();

      if (error) {
        console.error('Error updating workout details:', error);
        return NextResponse.json(
          { error: 'Error updating workout details' },
          { status: 500 }
        );
      }

      return NextResponse.json({ workout });
    } else if (body.status !== undefined) {
      // Original status update logic
      const { status } = body;

      const { data: workout, error } = await supabase
        .from('workouts')
        .update({ status })
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating workout:', error);
        return NextResponse.json(
          { error: 'Error updating workout' },
          { status: 500 }
        );
      }

      return NextResponse.json({ workout });
    } else {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Workout update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 