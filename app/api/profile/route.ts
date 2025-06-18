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
    
    // Validate required fields
    if (typeof body.full_name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid full name' }, 
        { status: 400 }
      );
    }

    // Validate optional fields
    const updateData: any = {
      full_name: body.full_name,
      updated_at: new Date().toISOString()
    };

    // Add birthday if provided
    if (body.birthday !== undefined) {
      if (body.birthday === null || body.birthday === '') {
        updateData.birthday = null;
      } else if (typeof body.birthday === 'string') {
        // Validate date format
        const date = new Date(body.birthday);
        if (isNaN(date.getTime())) {
          return NextResponse.json(
            { error: 'Invalid birthday format' }, 
            { status: 400 }
          );
        }
        updateData.birthday = body.birthday;
      } else {
        return NextResponse.json(
          { error: 'Invalid birthday' }, 
          { status: 400 }
        );
      }
    }

    // Add height if provided
    if (body.height !== undefined) {
      if (body.height === null || body.height === '') {
        updateData.height = null;
      } else {
        const height = Number(body.height);
        if (isNaN(height) || height < 0 || height > 300) {
          return NextResponse.json(
            { error: 'Invalid height (must be between 0-300 cm)' }, 
            { status: 400 }
          );
        }
        updateData.height = height;
      }
    }

    // Add weight if provided
    if (body.weight !== undefined) {
      if (body.weight === null || body.weight === '') {
        updateData.weight = null;
      } else {
        const weight = Number(body.weight);
        if (isNaN(weight) || weight < 0 || weight > 1000) {
          return NextResponse.json(
            { error: 'Invalid weight (must be between 0-1000 kg)' }, 
            { status: 400 }
          );
        }
        updateData.weight = weight;
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
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
