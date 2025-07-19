import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { createTestUser, loginTestUser } from './helpers';
import { sleep } from './utils';

describe('Exercises API', () => {
  let testUser: { id: string; email: string };
  let credentials: { email: string; password: string };

  const testExercise = {
    name: 'Test Exercise',
    description: 'Test exercise description',
    muscle_group: 'chest',
    equipment: 'barbell'
  };

  beforeEach(async () => {
    try {
      // Create and login a test user
      const result = await createTestUser();
      testUser = result.user as { id: string; email: string };
      credentials = result.credentials;
      await loginTestUser(credentials);
      // Add delay to avoid rate limits
      await sleep(1000);
    } catch (error: any) {
      if (error?.message?.includes('rate limit')) {
        console.warn('Rate limit hit, waiting longer...');
        await sleep(5000);
      } else {
        throw error;
      }
    }
  });

  it('should create a new exercise', async () => {
    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testExercise)
      });

      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.exercise).toBeDefined();
      expect(data.exercise.name).toBe(testExercise.name);
      expect(data.exercise.user_id).toBe(testUser.id);
    } catch (error: any) {
      if (error?.message?.includes('rate limit')) {
        console.warn('Rate limit hit, skipping test');
        return;
      }
      throw error;
    }
  });

  it('should not create exercise without authentication', async () => {
    // Sign out
    await fetch('/api/auth/signout', { method: 'POST' });

    const response = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testExercise)
    });

    expect(response.status).toBe(401);
  });

  it('should get all exercises for user', async () => {
    // First create an exercise
    await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testExercise)
    });

    const response = await fetch('/api/exercises');
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(Array.isArray(data.exercises)).toBe(true);
    expect(data.exercises.length).toBeGreaterThan(0);
    expect(data.exercises[0].user_id).toBe(testUser.id);
  });

  it('should update an exercise', async () => {
    // First create an exercise
    const createResponse = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testExercise)
    });
    const { exercise } = await createResponse.json();

    const updatedData = {
      ...testExercise,
      name: 'Updated Exercise Name'
    };

    const response = await fetch(`/api/exercises/${exercise.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.exercise.name).toBe(updatedData.name);
  });

  it('should delete an exercise', async () => {
    // First create an exercise
    const createResponse = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testExercise)
    });
    const { exercise } = await createResponse.json();

    const response = await fetch(`/api/exercises/${exercise.id}`, {
      method: 'DELETE'
    });

    expect(response.ok).toBe(true);

    // Verify it's deleted
    const getResponse = await fetch(`/api/exercises/${exercise.id}`);
    expect(getResponse.status).toBe(404);
  });

  it('should not update non-existent exercise', async () => {
    const response = await fetch('/api/exercises/non-existent-id', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testExercise)
    });

    expect(response.status).toBe(404);
  });

  it('should not delete non-existent exercise', async () => {
    const response = await fetch('/api/exercises/non-existent-id', {
      method: 'DELETE'
    });

    expect(response.status).toBe(404);
  });

  // Add delays between tests to avoid rate limits
  afterEach(async () => {
    await sleep(1000);
  });
}); 