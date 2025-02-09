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

    return NextResponse.json({ routine });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error fetching routine' },
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

    const { error: routineError } = await supabase
      .from('routines')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id);

    if (routineError) throw routineError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error deleting routine' },
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

    const { error: routineError } = await supabase
      .from('routines')
      .update({
        name: body.name,
        description: body.description
      })
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id);

    if (routineError) throw routineError;

    // Delete existing exercises
    const { error: deleteError } = await supabase
      .from('routine_exercises')
      .delete()
      .eq('routine_id', resolvedParams.id);

    if (deleteError) throw deleteError;

    // Insert new exercises
    if (body.routine_exercises.length > 0) {
      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(
          body.routine_exercises.map((re: any) => ({
            routine_id: resolvedParams.id,
            exercise_id: re.exercise_id,
            sets: re.sets,
            reps: re.reps,
            weight: re.weight,
            duration_minutes: re.duration_minutes
          }))
        );

      if (exercisesError) throw exercisesError;
    }

    // Fetch updated routine
    const { data: routine, error: fetchError } = await supabase
      .from('routines')
      .select(`
        *,
        routine_exercises (
          *,
          exercise:exercises (*)
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json({ routine });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error updating routine' },
      { status: 500 }
    );
  }
} 