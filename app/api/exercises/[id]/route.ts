import { createClient } from '@/utils/supabase/server'
import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(
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

    const { data: exercise, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ exercise });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error fetching exercise' },
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

    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error deleting exercise' },
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

    const { data, error } = await supabase
      .from('exercises')
      .update({
        name: body.name,
        description: body.description,
        muscle_group: body.muscle_group,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ exercise: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error updating exercise' },
      { status: 500 }
    );
  }
} 