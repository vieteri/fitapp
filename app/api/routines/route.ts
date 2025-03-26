import { verifyJWT } from '@/utils/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const result = await verifyJWT(request.headers.get('authorization'));

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { user, supabase } = result;
    console.log('Authenticated user ID:', user.id);

    // Get limit from URL params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '0');

    let query = supabase
      .from('routines')
      .select(`
        *,
        routine_exercises (
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

    const { data: routines, error } = await query;

    if (error) {
      console.error('Error fetching routines:', error);
      return NextResponse.json(
        { error: 'Error fetching routines', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ routines });
  } catch (error) {
    console.error('Routines route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const result = await verifyJWT(request.headers.get('authorization'));

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { user, supabase } = result;
    const body = await request.json();
    
    if (!body.name || !body.routine_exercises?.length) {
      return NextResponse.json(
        { error: 'Name and at least one exercise are required' },
        { status: 400 }
      );
    }

    // Create routine
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .insert({
        name: body.name,
        description: body.description,
        user_id: user.id
      })
      .select()
      .single();

    if (routineError) {
      console.error('Error creating routine:', routineError);
      return NextResponse.json(
        { error: 'Error creating routine' },
        { status: 500 }
      );
    }

    // Create routine exercises with sets
    const { error: exercisesError } = await supabase
      .from('routine_exercises')
      .insert(
        body.routine_exercises.map((ex: {
          exercise_id: string;
          reps: number;
          sets: number;
          weight?: number;
          duration_minutes?: number;
          order_index: number;
        }) => ({
          routine_id: routine.id,
          exercise_id: ex.exercise_id,
          sets: ex.sets || 1,
          reps: ex.reps,
          weight: ex.weight || null,
          duration_minutes: ex.duration_minutes || null,
          order_index: ex.order_index
        }))
      );

    if (exercisesError) {
      console.error('Error creating routine exercises:', exercisesError);
      // Delete the routine since exercise creation failed
      await supabase.from('routines').delete().eq('id', routine.id);
      return NextResponse.json(
        { error: 'Error creating routine exercises' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, routine });
  } catch (error) {
    console.error('Routine creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 