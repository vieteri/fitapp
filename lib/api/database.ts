import { createClient } from '@/utils/supabase/server';
import { CommonErrors, StandardApiError } from './errors';

export interface DatabaseResult<T> {
  success: true;
  data: T;
}

export interface DatabaseError {
  success: false;
  error: StandardApiError;
}

export type DatabaseResponse<T> = DatabaseResult<T> | DatabaseError;

/**
 * Helper function to execute database operations with standardized error handling
 */
export async function executeQuery<T>(
  operation: (supabase: any) => Promise<{ data: T; error: any }>
): Promise<DatabaseResponse<T>> {
  try {
    const supabase = await createClient();
    const { data, error } = await operation(supabase);
    
    if (error) {
      console.error('Database operation error:', error);
      
      // Handle specific database errors
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: CommonErrors.notFound('Resource')
        };
      }
      
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        return {
          success: false,
          error: CommonErrors.alreadyExists('Resource')
        };
      }
      
      if (error.code === '23503' || error.message?.includes('foreign key')) {
        return {
          success: false,
          error: new StandardApiError(
            'Invalid reference to related resource',
            'foreign_key_constraint' as any,
            400,
            error.message
          )
        };
      }
      
      return {
        success: false,
        error: CommonErrors.databaseError(error.message)
      };
    }
    
    return {
      success: true,
      data: data as T
    };
  } catch (error) {
    console.error('Database operation exception:', error);
    return {
      success: false,
      error: CommonErrors.internalError(
        error instanceof Error ? error.message : 'Unknown database error'
      )
    };
  }
}

/**
 * Helper function to check if database result contains an error
 */
export function isDatabaseError<T>(result: DatabaseResponse<T>): result is DatabaseError {
  return !result.success;
}

/**
 * Get user-owned resource with authorization check
 */
export async function getUserResource<T>(
  userId: string,
  tableName: string,
  resourceId: string,
  selectFields = '*'
): Promise<DatabaseResponse<T>> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from(tableName)
      .select(selectFields)
      .eq('id', resourceId)
      .eq('user_id', userId)
      .single();
  });
}

/**
 * Get user-owned resources with optional filtering and pagination
 */
export async function getUserResources<T>(
  userId: string,
  tableName: string,
  options: {
    selectFields?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  } = {}
): Promise<DatabaseResponse<T[]>> {
  return executeQuery(async (supabase) => {
    let query = supabase
      .from(tableName)
      .select(options.selectFields || '*')
      .eq('user_id', userId);
    
    // Apply additional filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    return await query;
  });
}

/**
 * Create a new user-owned resource
 */
export async function createUserResource<T>(
  userId: string,
  tableName: string,
  data: Omit<T, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<DatabaseResponse<T>> {
  return executeQuery(async (supabase) => {
    const resourceData = {
      ...data,
      user_id: userId
    };
    
    return await supabase
      .from(tableName)
      .insert(resourceData)
      .select()
      .single();
  });
}

/**
 * Update a user-owned resource with authorization check
 */
export async function updateUserResource<T>(
  userId: string,
  tableName: string,
  resourceId: string,
  updates: Partial<T>
): Promise<DatabaseResponse<T>> {
  return executeQuery(async (supabase) => {
    // First check if the resource exists and belongs to the user
    const { data: existing, error: checkError } = await supabase
      .from(tableName)
      .select('id')
      .eq('id', resourceId)
      .eq('user_id', userId)
      .single();
    
    if (checkError || !existing) {
      throw CommonErrors.notFound('Resource');
    }
    
    // Perform the update
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', resourceId)
      .eq('user_id', userId)
      .select()
      .single();
  });
}

/**
 * Delete a user-owned resource with authorization check
 */
export async function deleteUserResource(
  userId: string,
  tableName: string,
  resourceId: string
): Promise<DatabaseResponse<{ id: string }>> {
  return executeQuery(async (supabase) => {
    // First check if the resource exists and belongs to the user
    const { data: existing, error: checkError } = await supabase
      .from(tableName)
      .select('id')
      .eq('id', resourceId)
      .eq('user_id', userId)
      .single();
    
    if (checkError || !existing) {
      throw CommonErrors.notFound('Resource');
    }
    
    // Perform the deletion
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', resourceId)
      .eq('user_id', userId)
      .select('id')
      .single();
    
    return { data, error };
  });
}

/**
 * Get resource by ID without user ownership check (for public resources)
 */
export async function getResource<T>(
  tableName: string,
  resourceId: string,
  selectFields = '*'
): Promise<DatabaseResponse<T>> {
  return executeQuery(async (supabase) => {
    return await supabase
      .from(tableName)
      .select(selectFields)
      .eq('id', resourceId)
      .single();
  });
}

/**
 * Get resources with optional filtering and pagination (for public resources)
 */
export async function getResources<T>(
  tableName: string,
  options: {
    selectFields?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
    search?: { column: string; term: string };
  } = {}
): Promise<DatabaseResponse<T[]>> {
  return executeQuery(async (supabase) => {
    let query = supabase
      .from(tableName)
      .select(options.selectFields || '*');
    
    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    // Apply search
    if (options.search) {
      query = query.ilike(options.search.column, `%${options.search.term}%`);
    }
    
    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    return await query;
  });
}

/**
 * Execute a transaction with multiple operations
 */
export async function executeTransaction<T>(
  operations: Array<(supabase: any) => Promise<any>>
): Promise<DatabaseResponse<T[]>> {
  return executeQuery(async (supabase) => {
    // Note: Supabase doesn't have native transaction support in the client
    // This is a simplified version that executes operations sequentially
    // For true transactions, you'd need to use the database directly
    
    const results: T[] = [];
    
    for (const operation of operations) {
      const { data, error } = await operation(supabase);
      if (error) {
        throw error;
      }
      results.push(data);
    }
    
    return { data: results, error: null };
  });
}

/**
 * Helper to build complex select queries with relationships
 */
export function buildSelectQuery(
  baseFields: string[],
  relationships: Record<string, string[] | Record<string, string[]>>
): string {
  const parts = [...baseFields];
  
  Object.entries(relationships).forEach(([relationName, fields]) => {
    if (Array.isArray(fields)) {
      parts.push(`${relationName} (${fields.join(', ')})`);
    } else {
      // Nested relationships
      const nestedParts: string[] = [];
      Object.entries(fields).forEach(([nestedRelation, nestedFields]) => {
        if (Array.isArray(nestedFields)) {
          nestedParts.push(`${nestedRelation} (${nestedFields.join(', ')})`);
        }
      });
      parts.push(`${relationName} (${nestedParts.join(', ')})`);
    }
  });
  
  return parts.join(', ');
}