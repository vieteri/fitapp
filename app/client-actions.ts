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
  return localStorage.getItem('access_token');
};

// Helper function to add auth header to requests
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    signOut();
    throw new Error('Authentication token expired');
  }

  return response;
};
