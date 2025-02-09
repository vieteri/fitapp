import { createClient } from '@/utils/supabase/server';
import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(
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
    const { exercise_id, sets, reps, weight, order_index } = body;

    // Add exercise to routine
    const { data, error } = await supabase
      .from('routine_exercises')
      .insert({
        routine_id: resolvedParams.id,
        exercise_id,
        sets,
        reps,
        weight,
        order_index
      })
      .select(`
        *,
        exercise:exercises (*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ routine_exercise: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error adding exercise to routine' },
      { status: 500 }
    );
  }
} 