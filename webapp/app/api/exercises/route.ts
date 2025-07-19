import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json({ exercises });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching exercises' }, { status: 500 });
  }
} 