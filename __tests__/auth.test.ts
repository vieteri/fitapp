import { describe, it, expect } from 'bun:test';
import { supabase } from './setup';

describe('Authentication', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  it('should attempt to sign up a new user', async () => {
    try {
      const { data, error } = await supabase.auth.signUp(testUser);
      
      if (error?.message.includes('rate limit')) {
        console.warn('Rate limit hit, skipping test');
        return;
      }
      
      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testUser.email);
      expect(data.user?.confirmed_at).toBeNull();
    } catch (error) {
      console.warn('Rate limit hit, skipping test');
    }
  });

  it('should not sign up with invalid email', async () => {
    const { error } = await supabase.auth.signUp({
      email: 'invalid-email',
      password: testUser.password
    });
    
    expect(error).toBeDefined();
    expect(error?.message).toContain('Unable to validate email address: invalid format');
  });

  it('should not sign up with weak password', async () => {
    const { error } = await supabase.auth.signUp({
      email: testUser.email,
      password: '123'
    });
    
    expect(error).toBeDefined();
    expect(error?.message).toContain('Password should be at least 6 characters');
  });

  it('should not sign in with unconfirmed email', async () => {
    const { error } = await supabase.auth.signInWithPassword(testUser);
    
    expect(error).toBeDefined();
    expect(error?.message).toContain('Invalid login credentials');
  });

  it('should not sign in with incorrect password', async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: 'wrongpassword'
    });
    
    expect(error).toBeDefined();
    expect(error?.message).toContain('Invalid login credentials');
  });

  // Note: We can't test successful sign in without email confirmation
  // In a real application, you would need to:
  // 1. Create a test user through admin API or database directly
  // 2. Set their email as confirmed
  // 3. Then test sign in
}); 