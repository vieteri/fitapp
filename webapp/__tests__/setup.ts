/// <reference types="bun-types" />

import { beforeAll, afterAll, afterEach } from 'bun:test';
import { createClient } from '@supabase/supabase-js';

// Set up base URL for API requests
const BASE_URL = 'http://localhost:3000';

// Test context to manage auth state
export class TestContext {
  private static instance: TestContext;
  private currentSession: { access_token: string } | null = null;
  private currentUser: { id: string; email: string } | null = null;

  private constructor() {}

  static getInstance(): TestContext {
    if (!TestContext.instance) {
      TestContext.instance = new TestContext();
    }
    return TestContext.instance;
  }

  setSession(session: { access_token: string } | null) {
    this.currentSession = session;
  }

  setUser(user: { id: string; email: string } | null) {
    this.currentUser = user;
  }

  getSession() {
    return this.currentSession;
  }

  getUser() {
    return this.currentUser;
  }

  clear() {
    this.currentSession = null;
    this.currentUser = null;
  }
}

export const testContext = TestContext.getInstance();

// Create a test client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

// Clean up function to delete test data
export async function cleanupTestData() {
  const user = testContext.getUser();
  if (user) {
    try {
      await Promise.all([
        supabase.from('workouts').delete().eq('user_id', user.id),
        supabase.from('exercises').delete().eq('user_id', user.id)
      ]);
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  }
}

// Custom fetch that includes auth header
export async function authenticatedFetch(
  input: URL | RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const session = testContext.getSession();
  const headers = {
    ...init?.headers,
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
  };

  const url = typeof input === 'string' && input.startsWith('/') 
    ? `${BASE_URL}${input}` 
    : input;

  return fetch(url, { ...init, headers });
}

beforeAll(async () => {
  // Ensure environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Required environment variables are not set');
  }

  // Override global fetch with authenticated fetch
  global.fetch = authenticatedFetch;
});

afterEach(async () => {
  await cleanupTestData();
  testContext.clear();
});

afterAll(async () => {
  await supabase.auth.signOut();
  testContext.clear();
}); 