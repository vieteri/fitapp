import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import { loginSchema } from '@/lib/validations';
import { extractAndValidate } from '@/lib/api/validation';
import { withErrorHandling, CommonErrors } from '@/lib/api/errors';
import { Responses } from '@/lib/api/responses';

/**
 * User login endpoint
 * @description Authenticates a user with email and password
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Validate request body
  const { email, password } = await extractAndValidate(request, loginSchema);

  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Handle specific authentication errors
    if (error.message?.includes('Invalid login credentials')) {
      throw CommonErrors.badRequest('Invalid email or password');
    }
    
    if (error.message?.includes('Email not confirmed')) {
      throw CommonErrors.badRequest('Please confirm your email address before signing in');
    }
    
    throw CommonErrors.badRequest(error.message);
  }

  if (!data.user || !data.session) {
    throw CommonErrors.internalError('Failed to create user session');
  }

  // Return standardized success response with authentication headers
  const headers = {
    'X-Auth-User-ID': data.user.id,
    'X-Token-Expires': new Date(data.session.expires_at! * 1000).toISOString(),
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  return Responses.success({
    message: 'Successfully signed in',
    user: {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at
    },
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in
  }, undefined, headers);
}); 