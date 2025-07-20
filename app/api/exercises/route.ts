import { NextRequest } from 'next/server';
import { exerciseQuerySchema } from '@/lib/validations';
import { extractAndValidateQuery } from '@/lib/api/validation';
import { getResources, isDatabaseError } from '@/lib/api/database';
import { withErrorHandling } from '@/lib/api/errors';
import { Responses } from '@/lib/api/responses';

/**
 * Get all exercises with optional filtering
 * @description Retrieves a list of exercises with search and filtering capabilities
 * Exercises are global resources available to all users
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Validate query parameters
  const query = extractAndValidateQuery(request, exerciseQuerySchema);
  
  // Build database query options
  const options: any = {
    orderBy: { column: 'name', ascending: true },
    limit: query.limit || 10,
    offset: query.offset || ((query.page || 1) - 1) * (query.limit || 10)
  };
  
  // Add search filter if provided
  if (query.search) {
    options.search = { column: 'name', term: query.search };
  }
  
  // Add muscle group filter if provided
  if (query.muscle_group) {
    options.filters = { muscle_group: query.muscle_group };
  }
  
  // Fetch exercises from database (public resources, no user ownership)
  const result = await getResources('exercises', options);
  
  if (isDatabaseError(result)) {
    throw result.error;
  }
  
  // Return paginated response
  return Responses.paginated(result.data, {
    page: query.page || 1,
    limit: query.limit || 10,
    total: result.data.length // Note: In a real app, you'd get the actual total count
  });
}); 