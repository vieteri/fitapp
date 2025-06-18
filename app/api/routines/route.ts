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
          exercise:exercises (*),
          exercise_sets (*)
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
    
    console.log('Received routine data:', JSON.stringify(body, null, 2));
    
    if (!body.name || !body.exercises?.length) {
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
        { error: 'Error creating routine', details: routineError.message },
        { status: 500 }
      );
    }

    console.log('Created routine:', routine);

    // Create routine exercises and their sets
    const routineExercisesData = [];
    const exerciseSetsData = [];

    for (let i = 0; i < body.exercises.length; i++) {
      const ex = body.exercises[i];
      console.log(`Processing exercise ${i}:`, ex);

      if (!ex.exercise_id) {
        console.warn(`Skipping exercise ${i}: missing exercise_id`);
        continue;
      }

      // Ensure sets is an array and has at least one set
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      if (sets.length === 0) {
        console.warn(`Skipping exercise ${i}: no sets provided`);
        continue;
      }

      // Get default values from first set
      const firstSet = sets[0];
      const defaultReps = firstSet?.reps || 10;
      const defaultWeight = firstSet?.weight || null;
      const defaultDuration = firstSet?.duration_minutes || null;

      // Create routine exercise entry
      const routineExercise = {
        routine_id: routine.id,
        exercise_id: ex.exercise_id,
        sets: sets.length,
        reps: defaultReps,
        weight: defaultWeight,
        duration_minutes: defaultDuration,
        order_index: ex.order_index || i
      };
      
      console.log(`Adding routine exercise:`, routineExercise);
      routineExercisesData.push(routineExercise);
    }

    if (routineExercisesData.length === 0) {
      console.error('No valid exercises to add to routine');
      await supabase.from('routines').delete().eq('id', routine.id);
      return NextResponse.json(
        { error: 'No valid exercises provided' },
        { status: 400 }
      );
    }

    const { data: routineExercises, error: exercisesError } = await supabase
      .from('routine_exercises')
      .insert(routineExercisesData)
      .select();

    if (exercisesError) {
      console.error('Error creating routine exercises:', exercisesError);
      // Delete the routine since exercise creation failed
      await supabase.from('routines').delete().eq('id', routine.id);
      return NextResponse.json(
        { error: 'Error creating routine exercises', details: exercisesError.message },
        { status: 500 }
      );
    }

    console.log('Created routine exercises:', routineExercises);

    // Create individual exercise sets
    for (let i = 0; i < body.exercises.length; i++) {
      const ex = body.exercises[i];
      const routineExercise = routineExercises?.[i];
      
      if (!routineExercise || !ex.sets || !Array.isArray(ex.sets)) continue;

      for (let setIndex = 0; setIndex < ex.sets.length; setIndex++) {
        const set = ex.sets[setIndex];
        const exerciseSet = {
          routine_exercise_id: routineExercise.id,
          set_number: setIndex + 1,
          reps: set.reps || 10,
          weight: set.weight || null,
          duration_minutes: set.duration_minutes || null
        };
        
        console.log(`Adding exercise set:`, exerciseSet);
        exerciseSetsData.push(exerciseSet);
      }
    }

    if (exerciseSetsData.length > 0) {
      const { error: setsError } = await supabase
        .from('exercise_sets')
        .insert(exerciseSetsData);

      if (setsError) {
        console.error('Error creating exercise sets:', setsError);
        // Delete the routine and routine exercises since set creation failed
        await supabase.from('routines').delete().eq('id', routine.id);
        return NextResponse.json(
          { error: 'Error creating exercise sets', details: setsError.message },
          { status: 500 }
        );
      }
      
      console.log('Created exercise sets successfully');
    }

    console.log('Routine creation completed successfully');
    return NextResponse.json({ success: true, routine });
  } catch (error) {
    console.error('Routine creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 