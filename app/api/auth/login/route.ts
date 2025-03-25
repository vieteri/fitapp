import { createClient } from '@/utils/supabase/server';
import { validateEmail, validatePassword } from '@/utils/validation';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error.errors[0].message },
        { status: 400 }
      );
    }

    // Validate password
    const passwordResult = validatePassword(password);
    if (!passwordResult.success) {
      return NextResponse.json(
        { error: passwordResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailResult.data,
      password: passwordResult.data,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Return only necessary user data and tokens
    return NextResponse.json({
      message: 'Successfully signed in',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        created_at: data.user?.created_at
      },
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 