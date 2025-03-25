import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function verifyJWT(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'No bearer token provided', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  const supabase = await createClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('JWT verification error:', error);
      return { error: error.message, status: 401 };
    }

    if (!user) {
      return { error: 'Invalid token', status: 401 };
    }

    return { user, supabase };
  } catch (error) {
    console.error('JWT verification error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500 
    };
  }
} 