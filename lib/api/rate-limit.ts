import { NextRequest } from 'next/server';
import { CommonErrors } from './errors';

interface RateLimitRule {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (replace with Redis for production)
const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
export class RateLimiter {
  private rule: RateLimitRule;
  
  constructor(rule: RateLimitRule) {
    this.rule = rule;
  }
  
  /**
   * Check if request is rate limited
   */
  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remainingRequests: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const now = Date.now();
    const windowStart = now - this.rule.windowMs;
    
    // Clean up expired entries
    this.cleanup(windowStart);
    
    // Get or create record for identifier
    let record = store[identifier];
    
    if (!record || record.resetTime <= now) {
      // Create new window
      record = {
        count: 1,
        resetTime: now + this.rule.windowMs
      };
      store[identifier] = record;
      
      return {
        allowed: true,
        remainingRequests: this.rule.maxRequests - 1,
        resetTime: record.resetTime
      };
    }
    
    // Check if limit exceeded
    if (record.count >= this.rule.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: record.resetTime,
        retryAfter
      };
    }
    
    // Increment count
    record.count++;
    
    return {
      allowed: true,
      remainingRequests: this.rule.maxRequests - record.count,
      resetTime: record.resetTime
    };
  }
  
  /**
   * Clean up expired entries from store
   */
  private cleanup(windowStart: number): void {
    Object.keys(store).forEach(key => {
      if (store[key].resetTime <= windowStart) {
        delete store[key];
      }
    });
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header if available
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // For authenticated requests, use a hash of the token
    const token = authHeader.split(' ')[1];
    // Simple hash (in production, use a proper hash function)
    return `user:${token.substring(0, 10)}`;
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || 
           request.headers.get('x-real-ip') || 
           'unknown';
  
  return `ip:${ip}`;
}

/**
 * Rate limiting middleware factory
 */
export function withRateLimit(rule: RateLimitRule) {
  const limiter = new RateLimiter(rule);
  
  return function <THandler extends (req: NextRequest, ...args: any[]) => Promise<Response>>(
    handler: THandler
  ) {
    return async (request: NextRequest, ...args: any[]): Promise<Response> => {
      // Skip rate limiting in development
      if (process.env.NODE_ENV === 'development') {
        return handler(request, ...args);
      }
      
      const identifier = getClientIdentifier(request);
      const result = await limiter.checkLimit(identifier);
      
      if (!result.allowed) {
        throw CommonErrors.rateLimitExceeded();
      }
      
      // Call the original handler
      const response = await handler(request, ...args);
      
      // Add rate limit headers to response
      const headers = new Headers(response.headers);
      headers.set('X-RateLimit-Limit', rule.maxRequests.toString());
      headers.set('X-RateLimit-Remaining', result.remainingRequests.toString());
      headers.set('X-RateLimit-Reset', result.resetTime.toString());
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    };
  };
}

/**
 * Pre-configured rate limit rules for common use cases
 */
export const RateLimitRules = {
  // Strict rate limiting for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 attempts per 15 minutes
  },
  
  // Moderate rate limiting for API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 requests per minute
  },
  
  // Generous rate limiting for read operations
  read: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100 // 100 requests per minute
  },
  
  // Strict rate limiting for write operations
  write: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30 // 30 requests per minute
  },
  
  // Very strict rate limiting for expensive operations
  expensive: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10 // 10 requests per minute
  }
};

/**
 * Convenience functions for common rate limiting scenarios
 */
export const withAuthRateLimit = () => withRateLimit(RateLimitRules.auth);
export const withApiRateLimit = () => withRateLimit(RateLimitRules.api);
export const withReadRateLimit = () => withRateLimit(RateLimitRules.read);
export const withWriteRateLimit = () => withRateLimit(RateLimitRules.write);
export const withExpensiveRateLimit = () => withRateLimit(RateLimitRules.expensive);