"use client";

import { User } from "@supabase/auth-helpers-nextjs";
import { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, authFetch } from "@/app/client-actions";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  verified: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  verified: false
});

function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (!decodedPayload.exp) return true;
    return Date.now() >= (decodedPayload.exp * 1000) - 30000;
  } catch {
    return true;
  }
}

function parseUserFromToken(token: string): User | null {
  try {
    const [, payload] = token.split('.');
    const { sub, email, user_metadata } = JSON.parse(Buffer.from(payload, 'base64').toString());
    return {
      id: sub,
      email,
      ...user_metadata
    } as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Instant local check
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setLoading(false);
      return;
    }

    // Set initial user state from token
    const parsedUser = parseUserFromToken(token);
    setUser(parsedUser);
    setLoading(false);

    // Background verification
    const verifyToken = async () => {
      try {
        const response = await authFetch('/api/auth/verify');
        const data = await response.json();
        
        if (data.valid) {
          setUser(data.user);
          setVerified(true);
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      }
    };

    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, verified }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};