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

    const { data: workout, error } = await supabase
      .from('workouts')
      .insert({
        name: 'Custom Workout',
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create workout' },
        { status: 500 }
      );
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