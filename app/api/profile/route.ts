import { verifyJWT } from '@/utils/auth';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
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
    
    if (typeof body.full_name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid full name' }, 
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: body.full_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { error: 'Error updating profile' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return NextResponse.json(
        { error: 'Error fetching profile' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...data,
      email: user.email
    });
  } catch (error) {
    console.error('Profile route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
