import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resolvedParams = await params;
    // First delete associated workout exercises
    const { error: exercisesError } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', resolvedParams.id);

    if (exercisesError) throw exercisesError;

    // Then delete the workout
    const { error: workoutError } = await supabase
      .from('workouts')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', session.user.id);

    if (workoutError) throw workoutError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting workout' }, { status: 500 });
  }
} 