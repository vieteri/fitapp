import { NextRequest, NextResponse } from 'next/server';
import { createClient } from './utils/supabase/server'; // Adjust the path as necessary

export async function middleware(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // If the user is not authenticated and trying to access protected routes, redirect them
  if (!session && (pathname.startsWith('/profile') || pathname.startsWith('/workouts'))) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // If the user is authenticated and trying to access sign-in or sign-up, redirect them
  if (session && (pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Continue to the requested page
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile', '/workouts', '/sign-in', '/sign-up', '/protected/:path*'], // Adjust paths as necessary
};
