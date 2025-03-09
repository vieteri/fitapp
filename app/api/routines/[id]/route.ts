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
          exercise:exercises (*)
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
      // Update routine basic details if provided
      const updateData: Partial<{
        name: string;
        description: string | null;
        updated_at: string;
      }> = {
        updated_at: new Date().toISOString()
      };
      
      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      
      // Update routine details
      const { data: updatedRoutine, error: routineError } = await supabase
        .from('routines')
        .update(updateData)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (routineError) {
        console.error('Error updating routine:', routineError);
        return NextResponse.json(
          { error: 'Error updating routine' },
          { status: 500 }
        );
      }
      
      // Get current exercises
      const { data: currentExercises } = await supabase
        .from('routine_exercises')
        .select('id')
        .eq('routine_id', params.id);
        
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
          .from('routine_exercises')
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
            .from('routine_exercises')
            .update({
              exercise_id: exercise.exercise_id,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight || null,
              duration_minutes: exercise.duration_minutes || null,
              order_index: exercise.order_index || 0
            })
            .eq('id', exercise.id)
            .eq('routine_id', params.id);
            
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
            .from('routine_exercises')
            .insert({
              routine_id: params.id,
              exercise_id: exercise.exercise_id,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight || null,
              duration_minutes: exercise.duration_minutes || null,
              order_index: exercise.order_index || 0
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