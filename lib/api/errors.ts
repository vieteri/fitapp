import { NextResponse } from 'next/server';

export enum ApiErrorCode {
  // Authentication errors
  NO_TOKEN = 'no_token',
  TOKEN_EXPIRED = 'token_expired',
  INVALID_TOKEN = 'invalid_token',
  AUTH_ERROR = 'auth_error',
  NO_USER = 'no_user',
  SESSION_INVALID = 'session_invalid',
  NO_SESSION = 'no_session',
  
  // Validation errors
  VALIDATION_ERROR = 'validation_error',
  MISSING_REQUIRED_FIELD = 'missing_required_field',
  INVALID_FORMAT = 'invalid_format',
  
  // Database errors
  NOT_FOUND = 'not_found',
  ALREADY_EXISTS = 'already_exists',
  DATABASE_ERROR = 'database_error',
  FOREIGN_KEY_CONSTRAINT = 'foreign_key_constraint',
  
  // Authorization errors
  FORBIDDEN = 'forbidden',
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  
  // General errors
  INTERNAL_ERROR = 'internal_error',
  BAD_REQUEST = 'bad_request',
  METHOD_NOT_ALLOWED = 'method_not_allowed'
}

export interface ApiError {
  message: string;
  code: ApiErrorCode;
  status: number;
  details?: any;
}

export class StandardApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: any;

  constructor(message: string, code: ApiErrorCode, status: number, details?: any) {
    super(message);
    this.name = 'StandardApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Pre-defined common API errors
 */
export const CommonErrors = {
  // Authentication
  noToken: () => new StandardApiError(
    'No authentication token provided',
    ApiErrorCode.NO_TOKEN,
    401
  ),
  
  tokenExpired: () => new StandardApiError(
    'Authentication token has expired. Please sign in again.',
    ApiErrorCode.TOKEN_EXPIRED,
    401
  ),
  
  invalidToken: () => new StandardApiError(
    'Invalid authentication token. Please sign in again.',
    ApiErrorCode.INVALID_TOKEN,
    401
  ),
  
  authRequired: () => new StandardApiError(
    'Authentication required. Please sign in.',
    ApiErrorCode.AUTH_ERROR,
    401
  ),
  
  forbidden: () => new StandardApiError(
    'Access forbidden. You do not have permission to access this resource.',
    ApiErrorCode.FORBIDDEN,
    403
  ),
  
  // Database
  notFound: (resource: string) => new StandardApiError(
    `${resource} not found`,
    ApiErrorCode.NOT_FOUND,
    404
  ),
  
  alreadyExists: (resource: string) => new StandardApiError(
    `${resource} already exists`,
    ApiErrorCode.ALREADY_EXISTS,
    409
  ),
  
  databaseError: (details?: string) => new StandardApiError(
    'Database operation failed',
    ApiErrorCode.DATABASE_ERROR,
    500,
    details
  ),
  
  // Validation
  validationError: (details: any) => new StandardApiError(
    'Validation failed',
    ApiErrorCode.VALIDATION_ERROR,
    400,
    details
  ),
  
  missingField: (field: string) => new StandardApiError(
    `Missing required field: ${field}`,
    ApiErrorCode.MISSING_REQUIRED_FIELD,
    400
  ),
  
  invalidFormat: (field: string, expectedFormat?: string) => new StandardApiError(
    `Invalid format for field: ${field}${expectedFormat ? ` (expected: ${expectedFormat})` : ''}`,
    ApiErrorCode.INVALID_FORMAT,
    400
  ),
  
  // General
  badRequest: (message: string) => new StandardApiError(
    message,
    ApiErrorCode.BAD_REQUEST,
    400
  ),
  
  methodNotAllowed: (method: string) => new StandardApiError(
    `Method ${method} not allowed`,
    ApiErrorCode.METHOD_NOT_ALLOWED,
    405
  ),
  
  internalError: (details?: string) => new StandardApiError(
    'Internal server error',
    ApiErrorCode.INTERNAL_ERROR,
    500,
    details
  ),
  
  rateLimitExceeded: () => new StandardApiError(
    'Rate limit exceeded. Please try again later.',
    ApiErrorCode.RATE_LIMIT_EXCEEDED,
    429
  )
};

/**
 * Convert a StandardApiError to a NextResponse
 */
export function errorToResponse(error: StandardApiError): NextResponse {
  const body: { error: string; code: ApiErrorCode; details?: any } = {
    error: error.message,
    code: error.code
  };
  
  if (error.details) {
    body.details = error.details;
  }
  
  return NextResponse.json(body, { status: error.status });
}

/**
 * Handle unknown errors and convert them to standard API errors
 */
export function handleUnknownError(error: unknown): StandardApiError {
  if (error instanceof StandardApiError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Handle specific database errors
    if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      return CommonErrors.alreadyExists('Resource');
    }
    
    if (error.message?.includes('foreign key constraint') || error.message?.includes('violates foreign key')) {
      return new StandardApiError(
        'Invalid reference to related resource',
        ApiErrorCode.FOREIGN_KEY_CONSTRAINT,
        400,
        error.message
      );
    }
    
    if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
      return CommonErrors.notFound('Resource');
    }
    
    // Log the original error for debugging
    console.error('Unhandled error:', error);
    
    return CommonErrors.internalError(error.message);
  }
  
  console.error('Unknown error type:', error);
  return CommonErrors.internalError('Unknown error occurred');
}

/**
 * Middleware function to wrap API handlers with error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      const standardError = handleUnknownError(error);
      return errorToResponse(standardError);
    }
  };
}