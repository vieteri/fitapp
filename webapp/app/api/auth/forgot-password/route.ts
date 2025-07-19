import { createClient } from '@/utils/supabase/server';
import { validateEmail, validateUrl } from '@/utils/validation';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, callbackUrl } = await request.json();
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;

    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error.errors[0].message },
        { status: 400 }
      );
    }

    // Validate callback URL if provided
    if (callbackUrl) {
      const urlResult = validateUrl(callbackUrl);
      if (!urlResult.success) {
        return NextResponse.json(
          { error: urlResult.error.errors[0].message },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(emailResult.data, {
      redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Check your email for a link to reset your password.',
      ...(callbackUrl && { redirectTo: callbackUrl })
    }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 