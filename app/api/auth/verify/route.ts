import { NextRequest } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/auth/middleware';
import { withErrorHandling } from '@/lib/api/errors';
import { Responses } from '@/lib/api/responses';

/**
 * Verify authentication token
 * @description Validates the authentication token and returns user info
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const authResult = await authenticateRequest(request);
  
  if (isAuthError(authResult)) {
    return Responses.success({
      valid: false,
      error: authResult.error
    });
  }

  const { user } = authResult;
  
  return Responses.success({
    valid: true,
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    }
  });
});