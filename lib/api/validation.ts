import { NextRequest } from 'next/server';
import { z, ZodSchema, ZodError } from 'zod';
import { CommonErrors, StandardApiError } from './errors';

export interface ValidationResult<T> {
  success: true;
  data: T;
}

export interface ValidationError {
  success: false;
  error: StandardApiError;
}

export type ValidatedResult<T> = ValidationResult<T> | ValidationError;

/**
 * Validate request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<ValidatedResult<T>> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return {
        success: false,
        error: CommonErrors.validationError(formatZodErrors(result.error))
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: CommonErrors.badRequest('Invalid JSON in request body')
      };
    }
    
    return {
      success: false,
      error: CommonErrors.internalError('Failed to parse request body')
    };
  }
}

/**
 * Validate URL parameters against a Zod schema
 */
export function validateParams<T>(
  params: any,
  schema: ZodSchema<T>
): ValidatedResult<T> {
  const result = schema.safeParse(params);
  
  if (!result.success) {
    return {
      success: false,
      error: CommonErrors.validationError(formatZodErrors(result.error))
    };
  }
  
  return {
    success: true,
    data: result.data
  };
}

/**
 * Validate URL search parameters against a Zod schema
 */
export function validateSearchParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): ValidatedResult<T> {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  
  const result = schema.safeParse(params);
  
  if (!result.success) {
    return {
      success: false,
      error: CommonErrors.validationError(formatZodErrors(result.error))
    };
  }
  
  return {
    success: true,
    data: result.data
  };
}

/**
 * Format Zod validation errors into a user-friendly format
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    const field = path || 'root';
    
    if (!formattedErrors[field]) {
      formattedErrors[field] = [];
    }
    
    formattedErrors[field].push(err.message);
  });
  
  return formattedErrors;
}

/**
 * Helper function to check if validation result contains an error
 */
export function isValidationError<T>(result: ValidatedResult<T>): result is ValidationError {
  return !result.success;
}

/**
 * Middleware function to validate request data and handle errors automatically
 */
export function withValidation<TBody = any, TParams = any, TQuery = any>({
  bodySchema,
  paramsSchema,
  querySchema
}: {
  bodySchema?: ZodSchema<TBody>;
  paramsSchema?: ZodSchema<TParams>;
  querySchema?: ZodSchema<TQuery>;
}) {
  return function <THandler extends (req: NextRequest, context: any) => Promise<Response>>(
    handler: THandler
  ) {
    return async (request: NextRequest, context: any): Promise<Response> => {
      try {
        // Validate parameters if schema provided
        if (paramsSchema) {
          const paramResult = validateParams(context.params, paramsSchema);
          if (isValidationError(paramResult)) {
            throw paramResult.error;
          }
          context.validatedParams = paramResult.data;
        }
        
        // Validate query parameters if schema provided
        if (querySchema) {
          const queryResult = validateSearchParams(request, querySchema);
          if (isValidationError(queryResult)) {
            throw queryResult.error;
          }
          context.validatedQuery = queryResult.data;
        }
        
        // Validate body if schema provided
        if (bodySchema) {
          const bodyResult = await validateRequestBody(request, bodySchema);
          if (isValidationError(bodyResult)) {
            throw bodyResult.error;
          }
          context.validatedBody = bodyResult.data;
        }
        
        return await handler(request, context);
      } catch (error) {
        if (error instanceof StandardApiError) {
          throw error;
        }
        throw CommonErrors.internalError('Validation middleware error');
      }
    };
  };
}

/**
 * Helper to extract and validate specific fields from request body
 */
export async function extractAndValidate<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  const result = await validateRequestBody(request, schema);
  
  if (isValidationError(result)) {
    throw result.error;
  }
  
  return result.data;
}

/**
 * Helper to validate and extract URL parameters
 */
export function extractAndValidateParams<T>(
  params: any,
  schema: ZodSchema<T>
): T {
  const result = validateParams(params, schema);
  
  if (isValidationError(result)) {
    throw result.error;
  }
  
  return result.data;
}

/**
 * Helper to validate and extract search parameters
 */
export function extractAndValidateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  const result = validateSearchParams(request, schema);
  
  if (isValidationError(result)) {
    throw result.error;
  }
  
  return result.data;
}