"use client";

import { User } from "@supabase/auth-helpers-nextjs";
import { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, authFetch } from "@/app/client-actions";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const response = await authFetch('/api/auth/verify');
          const data = await response.json();
          if (data.valid) {
            setUser(data.user);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
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