"use client";

import { signIn } from "@/app/client-actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from "react";
import { User } from "@supabase/auth-js";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function Login(props: { searchParams: Promise<Message> }) {
  const { setUser } = useAuth();
  const [message, setMessage] = useState<Message | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMessage = async () => {
      const resolvedMessage = await props.searchParams;
      setMessage(resolvedMessage);
    };
    fetchMessage();
  }, [props.searchParams]);

  const handleSignIn = async (formData: FormData) => {
    const email = formData.get("email") as string;
    console.log("Email:", email);
    try {
      await signIn(formData, setUser);
      router.push("/");
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <form className="flex flex-col w-full max-w-md mx-auto p-4 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
        <h1 className="text-2xl font-medium">Sign in</h1>
        <p className="text-sm text-foreground">
          Don&apos;t have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-up">
            Sign up
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              className="text-xs text-foreground underline"
              href="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            required
          />
          <SubmitButton pendingText="Signing In..." formAction={handleSignIn}>
            Sign in
          </SubmitButton>
          {message && <FormMessage message={message} />}
        </div>
      </form>
    </div>
  );
}
