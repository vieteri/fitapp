"use client"

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { User } from "@supabase/auth-js";

export const signIn = async (formData: FormData, setUser: (user: User | null) => void) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  // Store tokens in localStorage
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);

  setUser(data.user);
};

export const signOut = async () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/sign-in';
};

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// Helper function to add auth header to requests
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  if (!token) {
    const error = new Error('No authentication token found');
    (error as any).status = 401;
    throw error;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      const error = new Error('Authentication token expired');
      (error as any).status = response.status;
      throw error;
    }

    return response;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const networkError = new Error('Network error - please check your connection');
      (networkError as any).status = 0;
      throw networkError;
    }
    throw error;
  }
};
