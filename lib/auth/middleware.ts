import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthResult {
  user: any;
  supabase: any;
}

export interface AuthError {
  error: string;
  status: number;
  code: string;
}

export type AuthResponse = AuthResult | AuthError;

/**
 * Unified authentication middleware for API routes
 * Supports both Bearer token and session-based authentication
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResponse> {
  const authHeader = request.headers.get('authorization');
  const supabase = await createClient();

  // Try Bearer token authentication first
  if (authHeader?.startsWith('Bearer ')) {
    return await authenticateWithBearerToken(authHeader, supabase);
  }

  // Fall back to session-based authentication
  return await authenticateWithSession(supabase);
}

/**
 * Authenticate using Bearer token from Authorization header
 */
async function authenticateWithBearerToken(authHeader: string, supabase: any): Promise<AuthResponse> {
  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('JWT verification error:', error);
      
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

/**
 * Authenticate using session cookies (for routes without Bearer token)
 */
async function authenticateWithSession(supabase: any): Promise<AuthResponse> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Session authentication error:', error);
      return { 
        error: 'Authentication required. Please sign in.', 
        status: 401,
        code: 'session_invalid'
      };
    }

    if (!user) {
      return { 
        error: 'Authentication required. Please sign in.', 
        status: 401,
        code: 'no_session'
      };
    }

    return { user, supabase };
  } catch (error) {
    console.error('Session authentication error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown authentication error',
      status: 500,
      code: 'server_error'
    };
  }
}

/**
 * Helper function to check if auth result contains an error
 */
export function isAuthError(result: AuthResponse): result is AuthError {
  return 'error' in result;
}

/**
 * Helper function to create standardized auth error response
 */
export function createAuthErrorResponse(result: AuthError): NextResponse {
  return NextResponse.json(
    { error: result.error, code: result.code },
    { status: result.status }
  );
}