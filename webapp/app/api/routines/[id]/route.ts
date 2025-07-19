import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { data: routine, error } = await supabase
      .from('routines')
      .select(`
        *,
        routine_exercises (
          *,
          exercise:exercises (*),
          exercise_sets (*)
        )
      `)
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    if (!routine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    if (routine.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({ routine });
  } catch (error) {
    console.error('Routine route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: routine, error: fetchError } = await supabase
      .from('routines')
      .select('user_id')
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !routine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    if (routine.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { error: deleteError } = await supabase
      .from('routines')
      .delete()
      .eq('id', resolvedParams.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Routine route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (typeof body.name !== 'string' || typeof body.description !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { data: routine, error: fetchError } = await supabase
      .from('routines')
      .select('user_id')
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !routine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    if (routine.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { error: updateError } = await supabase
      .from('routines')
      .update({
        name: body.name,
        description: body.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resolvedParams.id);

    if (updateError) {
      console.error('Error updating routine:', updateError);
      return NextResponse.json(
        { error: 'Error updating routine' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Routine route error:', error);
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
    
    // Check if we're updating exercises
    if (body.exercises !== undefined) {
      // First, fetch existing routine exercises to get their IDs
      const { data: existingExercises } = await supabase
        .from('routine_exercises')
        .select('id')
        .eq('routine_id', params.id);

      if (existingExercises?.length) {
        // Delete existing exercise sets
        await supabase
          .from('exercise_sets')
          .delete()
          .in('routine_exercise_id', existingExercises.map(ex => ex.id));

        // Delete existing routine exercises
        await supabase
          .from('routine_exercises')
          .delete()
          .eq('routine_id', params.id);
      }

      // Create routine exercises and their sets
      const routineExercisesData = [];
      const exerciseSetsData = [];

      for (const ex of body.exercises) {
        if (!ex.exercise_id || !ex.sets || ex.sets.length === 0) {
          continue;
        }

        // Create routine exercise entry
        const routineExercise = {
          routine_id: params.id,
          exercise_id: ex.exercise_id,
          sets: ex.sets.length,
          reps: ex.sets[0]?.reps || 10, // Use first set's reps as default
          weight: ex.sets[0]?.weight || null, // Use first set's weight as default
          duration_minutes: ex.sets[0]?.duration_minutes || null,
          order_index: ex.order_index || 0
        };
        routineExercisesData.push(routineExercise);
      }

      const { data: newRoutineExercises, error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercisesData)
        .select();

      if (exercisesError) {
        console.error('Error updating routine exercises:', exercisesError);
        return NextResponse.json(
          { error: 'Error updating routine exercises' },
          { status: 500 }
        );
      }

      // Create individual exercise sets
      for (let i = 0; i < body.exercises.length; i++) {
        const ex = body.exercises[i];
        const routineExercise = newRoutineExercises?.[i];
        
        if (!routineExercise || !ex.sets) continue;

        for (let setIndex = 0; setIndex < ex.sets.length; setIndex++) {
          const set = ex.sets[setIndex];
          exerciseSetsData.push({
            routine_exercise_id: routineExercise.id,
            set_number: setIndex + 1,
            reps: set.reps || 10,
            weight: set.weight || null,
            duration_minutes: set.duration_minutes || null
          });
        }
      }

      if (exerciseSetsData.length > 0) {
        const { error: setsError } = await supabase
          .from('exercise_sets')
          .insert(exerciseSetsData);

        if (setsError) {
          console.error('Error creating exercise sets:', setsError);
          return NextResponse.json(
            { error: 'Error creating exercise sets' },
            { status: 500 }
          );
        }
      }

      // Get the updated routine with exercises
      const { data: routine, error: fetchError } = await supabase
        .from('routines')
        .select(`
          *,
          routine_exercises (
            *,
            exercise:exercises (*)
          )
        `)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching updated routine:', fetchError);
        return NextResponse.json(
          { error: 'Error fetching updated routine' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ routine });
    } else {
      // Basic routine details update (original code)
      const updateData: Partial<{
        name: string;
        description: string | null;
        updated_at: string;
      }> = {};
      
      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      
      // Return early if no fields to update
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: 'No valid fields to update' },
          { status: 400 }
        );
      }
      
      // Add updated_at timestamp
      updateData.updated_at = new Date().toISOString();

      const { data: routine, error } = await supabase
        .from('routines')
        .update(updateData)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select(`
          *,
          routine_exercises (
            *,
            exercise:exercises (*)
          )
        `)
        .single();

      if (error) {
        console.error('Error updating routine:', error);
        return NextResponse.json(
          { error: 'Error updating routine' },
          { status: 500 }
        );
      }

      return NextResponse.json({ routine });
    }
  } catch (error) {
    console.error('Routine update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 