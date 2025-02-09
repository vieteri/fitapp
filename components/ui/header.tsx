import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/auth-js";
import { useAuth } from "@/context/auth-context";

export function Header() {
  const { user } = useAuth();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="w-full border-b border-b-foreground/10">
      <div className="container max-w-7xl mx-auto px-6 h-16">
        <nav className="flex justify-between items-center h-full">
          <div className="flex gap-6 items-center">
            <Link href="/" className="font-semibold">
              FitTrack
            </Link>
            {user && (
              <div className="hidden md:flex gap-4">
                <Link 
                  href="/workouts" 
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Workouts
                </Link>
                <Link 
                  href="/profile" 
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Profile
                </Link>

                <Link 
                  href="/routines" 
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Routines
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button onClick={handleSignOut} className="text-foreground/60 hover:text-foreground transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/sign-in" 
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up" 
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}