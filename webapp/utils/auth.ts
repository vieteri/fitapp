import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function verifyJWT(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'No bearer token provided', status: 401, code: 'no_token' };
  }

  const token = authHeader.split(' ')[1];
  const supabase = await createClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('JWT verification error:', error);
      
      // Handle specific JWT errors
      if (error.message?.includes('token is expired') || error.code === 'bad_jwt') {
        return { 
          error: 'Authentication token has expired. Please sign in again.', 
          status: 401,
          code: 'token_expired'
        };
      }
      
      if (error.message?.includes('invalid JWT') || error.message?.includes('unable to parse')) {
        return { 
          error: 'Invalid authentication token. Please sign in again.', 
          status: 401,
          code: 'invalid_token'
        };
      }
      
      return { 
        error: error.message || 'Authentication failed', 
        status: 401,
        code: 'auth_error'
      };
    }

    if (!user) {
      return { 
        error: 'Invalid token - no user found', 
        status: 401,
        code: 'no_user'
      };
    }

    return { user, supabase };
  } catch (error) {
    console.error('JWT verification error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message?.includes('token is expired') || error.message?.includes('bad_jwt')) {
        return { 
          error: 'Authentication token has expired. Please sign in again.', 
          status: 401,
          code: 'token_expired'
        };
      }
      
      if (error.message?.includes('invalid JWT')) {
        return { 
          error: 'Invalid authentication token. Please sign in again.', 
          status: 401,
          code: 'invalid_token'
        };
      }
    }
    
    return { 
      error: error instanceof Error ? error.message : 'Unknown authentication error',
      status: 500,
      code: 'server_error'
    };
  }
} 