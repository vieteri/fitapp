import { NextResponse } from 'next/server';
import { StandardApiError, errorToResponse } from './errors';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  meta?: Record<string, any>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Create a successful response with data
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: Record<string, any>,
  headers?: Record<string, string>
): NextResponse {
  const response: ApiResponse<T> = { data };
  
  if (meta) {
    response.meta = meta;
  }
  
  const responseHeaders = headers ? new Headers(headers) : undefined;
  
  return NextResponse.json(response, { 
    status,
    headers: responseHeaders
  });
}

/**
 * Create a successful response with a message
 */
export function messageResponse(
  message: string,
  status: number = 200,
  meta?: Record<string, any>
): NextResponse {
  const response: ApiResponse = { message };
  
  if (meta) {
    response.meta = meta;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Create a paginated list response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  status: number = 200
): NextResponse {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  const meta: PaginationMeta = {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages,
    hasNextPage: pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1
  };
  
  const response: ListResponse<T> = {
    data,
    meta
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse {
  return successResponse(data, 201, meta);
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Create an error response from StandardApiError
 */
export function errorResponse(error: StandardApiError): NextResponse {
  return errorToResponse(error);
}

/**
 * Create a not found response (404)
 */
export function notFoundResponse(resource?: string): NextResponse {
  const message = resource ? `${resource} not found` : 'Resource not found';
  return NextResponse.json(
    { error: message, code: 'not_found' },
    { status: 404 }
  );
}

/**
 * Create an unauthorized response (401)
 */
export function unauthorizedResponse(message: string = 'Authentication required'): NextResponse {
  return NextResponse.json(
    { error: message, code: 'unauthorized' },
    { status: 401 }
  );
}

/**
 * Create a forbidden response (403)
 */
export function forbiddenResponse(message: string = 'Access forbidden'): NextResponse {
  return NextResponse.json(
    { error: message, code: 'forbidden' },
    { status: 403 }
  );
}

/**
 * Create a validation error response (400)
 */
export function validationErrorResponse(
  errors: Record<string, string[]>,
  message: string = 'Validation failed'
): NextResponse {
  return NextResponse.json(
    { 
      error: message, 
      code: 'validation_error',
      details: errors
    },
    { status: 400 }
  );
}

/**
 * Create a conflict response (409)
 */
export function conflictResponse(message: string = 'Resource already exists'): NextResponse {
  return NextResponse.json(
    { error: message, code: 'conflict' },
    { status: 409 }
  );
}

/**
 * Create an internal server error response (500)
 */
export function internalErrorResponse(
  message: string = 'Internal server error',
  details?: any
): NextResponse {
  const response: ApiResponse = {
    error: message,
    code: 'internal_error'
  };
  
  if (details && process.env.NODE_ENV === 'development') {
    response.meta = { details };
  }
  
  return NextResponse.json(response, { status: 500 });
}

/**
 * Create a method not allowed response (405)
 */
export function methodNotAllowedResponse(allowedMethods: string[]): NextResponse {
  return NextResponse.json(
    { 
      error: 'Method not allowed', 
      code: 'method_not_allowed',
      meta: { allowedMethods }
    },
    { 
      status: 405,
      headers: {
        'Allow': allowedMethods.join(', ')
      }
    }
  );
}

/**
 * Create a rate limit exceeded response (429)
 */
export function rateLimitResponse(
  retryAfter?: number,
  message: string = 'Rate limit exceeded'
): NextResponse {
  const headers: Record<string, string> = {};
  
  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString();
  }
  
  return NextResponse.json(
    { 
      error: message, 
      code: 'rate_limit_exceeded',
      meta: retryAfter ? { retryAfter } : undefined
    },
    { 
      status: 429,
      headers
    }
  );
}

/**
 * Helper to handle standard API patterns
 */
export class ApiResponseBuilder {
  private status: number = 200;
  private data: any = null;
  private message: string | null = null;
  private meta: Record<string, any> = {};
  private errorCode: string | null = null;

  static create(): ApiResponseBuilder {
    return new ApiResponseBuilder();
  }

  withStatus(status: number): ApiResponseBuilder {
    this.status = status;
    return this;
  }

  withData(data: any): ApiResponseBuilder {
    this.data = data;
    return this;
  }

  withMessage(message: string): ApiResponseBuilder {
    this.message = message;
    return this;
  }

  withMeta(meta: Record<string, any>): ApiResponseBuilder {
    this.meta = { ...this.meta, ...meta };
    return this;
  }

  withError(error: string, code?: string): ApiResponseBuilder {
    this.message = error;
    if (code) {
      this.errorCode = code;
    }
    return this;
  }

  withPagination(pagination: {
    page: number;
    limit: number;
    total: number;
  }): ApiResponseBuilder {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    this.meta.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1
    };
    
    return this;
  }

  build(): NextResponse {
    const response: ApiResponse = {};
    
    if (this.data !== null) {
      response.data = this.data;
    }
    
    if (this.message) {
      if (this.errorCode || this.status >= 400) {
        response.error = this.message;
      } else {
        response.message = this.message;
      }
    }
    
    if (this.errorCode) {
      response.code = this.errorCode;
    }
    
    if (Object.keys(this.meta).length > 0) {
      response.meta = this.meta;
    }
    
    return NextResponse.json(response, { status: this.status });
  }
}

/**
 * Helper to standardize common response patterns
 */
export const Responses = {
  success: <T>(data: T, meta?: Record<string, any>, headers?: Record<string, string>) => 
    successResponse(data, 200, meta, headers),
  created: <T>(data: T, meta?: Record<string, any>) => createdResponse(data, meta),
  noContent: () => noContentResponse(),
  message: (message: string, meta?: Record<string, any>) => messageResponse(message, 200, meta),
  paginated: <T>(data: T[], pagination: { page: number; limit: number; total: number }) => 
    paginatedResponse(data, pagination),
  
  // Error responses
  notFound: (resource?: string) => notFoundResponse(resource),
  unauthorized: (message?: string) => unauthorizedResponse(message),
  forbidden: (message?: string) => forbiddenResponse(message),
  validation: (errors: Record<string, string[]>, message?: string) => 
    validationErrorResponse(errors, message),
  conflict: (message?: string) => conflictResponse(message),
  internal: (message?: string, details?: any) => internalErrorResponse(message, details),
  methodNotAllowed: (allowedMethods: string[]) => methodNotAllowedResponse(allowedMethods),
  rateLimit: (retryAfter?: number, message?: string) => rateLimitResponse(retryAfter, message)
};