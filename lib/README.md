# Backend Architecture Overview

This document outlines the new backend architecture and utilities implemented to improve code clarity, consistency, and maintainability.

## 📁 Directory Structure

```
lib/
├── api/
│   ├── database.ts      # Reusable database operation helpers
│   ├── errors.ts        # Centralized error handling system
│   ├── rate-limit.ts    # Rate limiting middleware
│   ├── responses.ts     # Standardized response formatting
│   └── validation.ts    # Request validation middleware
├── auth/
│   └── middleware.ts    # Unified authentication middleware
├── validations/
│   └── index.ts         # Centralized Zod validation schemas
└── README.md           # This file
```

## 🔧 Core Components

### 1. Authentication Middleware (`lib/auth/middleware.ts`)

Unified authentication that supports both Bearer token and session-based auth:

```typescript
import { authenticateRequest, isAuthError, createAuthErrorResponse } from '@/lib/auth/middleware';

export const GET = async (request: NextRequest) => {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) {
    return createAuthErrorResponse(authResult);
  }
  
  const { user, supabase } = authResult;
  // Your authenticated logic here
};
```

### 2. Error Handling System (`lib/api/errors.ts`)

Standardized error types and handling:

```typescript
import { withErrorHandling, CommonErrors } from '@/lib/api/errors';

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Your logic here
  
  // Throw standardized errors
  if (!data) {
    throw CommonErrors.notFound('Resource');
  }
  
  return response;
});
```

### 3. Validation Schemas (`lib/validations/index.ts`)

Centralized Zod schemas for all data types:

```typescript
import { exerciseSchema, routineCreateSchema } from '@/lib/validations';
import { extractAndValidate } from '@/lib/api/validation';

export const POST = async (request: NextRequest) => {
  const data = await extractAndValidate(request, exerciseSchema);
  // data is now fully typed and validated
};
```

### 4. Database Helpers (`lib/api/database.ts`)

Reusable database operations with error handling:

```typescript
import { getUserResource, createUserResource, isDatabaseError } from '@/lib/api/database';

// Get user-owned resource
const result = await getUserResource(userId, 'routines', routineId);
if (isDatabaseError(result)) {
  throw result.error;
}

// Create new resource
const newResult = await createUserResource(userId, 'exercises', exerciseData);
```

### 5. Response Utilities (`lib/api/responses.ts`)

Standardized response formatting:

```typescript
import { Responses } from '@/lib/api/responses';

// Success responses
return Responses.success(data);
return Responses.created(newResource);
return Responses.paginated(items, pagination);

// Error responses
return Responses.notFound('Exercise');
return Responses.validation(errors);
```

### 6. Rate Limiting (`lib/api/rate-limit.ts`)

Production-ready rate limiting:

```typescript
import { withAuthRateLimit, withApiRateLimit } from '@/lib/api/rate-limit';

export const POST = withAuthRateLimit()(
  withErrorHandling(async (request: NextRequest) => {
    // Your handler logic
  })
);
```

## 🚀 Usage Examples

### Complete API Route Example

```typescript
import { NextRequest } from 'next/server';
import { routineCreateSchema, routineQuerySchema } from '@/lib/validations';
import { authenticateRequest, isAuthError, createAuthErrorResponse } from '@/lib/auth/middleware';
import { extractAndValidate, extractAndValidateQuery } from '@/lib/api/validation';
import { getUserResources, createUserResource, isDatabaseError } from '@/lib/api/database';
import { withErrorHandling } from '@/lib/api/errors';
import { Responses } from '@/lib/api/responses';
import { withApiRateLimit } from '@/lib/api/rate-limit';

/**
 * Get user routines with filtering and pagination
 */
export const GET = withApiRateLimit()(
  withErrorHandling(async (request: NextRequest) => {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return createAuthErrorResponse(authResult);
    }
    
    // Validate query parameters
    const query = extractAndValidateQuery(request, routineQuerySchema);
    
    // Fetch data
    const result = await getUserResources(authResult.user.id, 'routines', {
      limit: query.limit,
      offset: (query.page - 1) * query.limit,
      orderBy: { column: 'created_at', ascending: false }
    });
    
    if (isDatabaseError(result)) {
      throw result.error;
    }
    
    return Responses.paginated(result.data, query);
  })
);

/**
 * Create new routine
 */
export const POST = withApiRateLimit()(
  withErrorHandling(async (request: NextRequest) => {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return createAuthErrorResponse(authResult);
    }
    
    // Validate request body
    const routineData = await extractAndValidate(request, routineCreateSchema);
    
    // Create routine
    const result = await createUserResource(
      authResult.user.id, 
      'routines', 
      routineData
    );
    
    if (isDatabaseError(result)) {
      throw result.error;
    }
    
    return Responses.created(result.data);
  })
);
```

## 🎯 Benefits

### Before vs After

**Before:**
- Mixed authentication patterns across routes
- Inline validation with different patterns
- Inconsistent error handling and responses
- Code duplication
- No rate limiting

**After:**
- ✅ Unified authentication middleware
- ✅ Centralized validation schemas
- ✅ Standardized error handling
- ✅ Consistent response formatting
- ✅ Reusable database helpers
- ✅ Built-in rate limiting
- ✅ Full TypeScript support
- ✅ Comprehensive documentation

### Key Improvements

1. **Consistency**: All routes follow the same patterns
2. **Type Safety**: Full TypeScript support with inferred types
3. **Maintainability**: Changes to patterns affect all routes
4. **Security**: Built-in authentication and rate limiting
5. **Developer Experience**: Clear, predictable APIs
6. **Error Handling**: Standardized error responses
7. **Performance**: Optimized database operations

## 🔄 Migration Guide

To migrate existing routes to the new patterns:

1. **Import new utilities** instead of inline logic
2. **Wrap handlers** with `withErrorHandling()`
3. **Use authentication middleware** instead of manual checks
4. **Replace validation** with centralized schemas
5. **Use response helpers** instead of manual `NextResponse.json()`
6. **Add rate limiting** for production routes

## 📝 Next Steps

1. **Migrate remaining routes** to use new patterns
2. **Add comprehensive tests** for all utilities
3. **Implement Redis** for rate limiting in production
4. **Add OpenAPI documentation** generation
5. **Create API versioning** strategy
6. **Add request logging** and monitoring

This architecture provides a solid foundation for a scalable, maintainable API that follows Next.js best practices while ensuring consistency and developer productivity.