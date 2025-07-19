import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter');

// URL validation for callbacks
export const urlSchema = z.string().url().refine(
  (url) => {
    try {
      const urlObj = new URL(url);
      const trustedDomains = [
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        // Add other trusted domains here
      ];
      return trustedDomains.some(domain => {
        try {
          return new URL(domain).origin === urlObj.origin;
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  },
  { message: 'URL must be from a trusted domain' }
);

// Validate email
export const validateEmail = (email: string) => {
  return emailSchema.safeParse(email);
};

// Validate password
export const validatePassword = (password: string) => {
  return passwordSchema.safeParse(password);
};

// Validate URL
export const validateUrl = (url: string) => {
  return urlSchema.safeParse(url);
}; 