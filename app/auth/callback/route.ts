"use server";

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Exchange code error:", error.message);
      return NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("Get user error:", userError.message);
      return NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
    }

    if (user?.user_metadata?.email) {
      return NextResponse.redirect(new URL('/workouts', requestUrl.origin));
    }
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  // If there's an error, redirect to sign-in
  return NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
}
