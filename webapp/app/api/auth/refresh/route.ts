import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const refreshToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (data.session?.access_token && data.session?.refresh_token) {
      return NextResponse.json({
        message: 'Token refreshed successfully',
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          created_at: data.user?.created_at
        }
      });
    }

    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}