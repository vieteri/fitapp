"use client"

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { User } from "@supabase/auth-js";

export const signIn = async (formData: FormData, setUser: (user: User | null) => void) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.session) {
    const { user } = data.session;
    setUser(user);
  }
};

export const signOut = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message };
};
