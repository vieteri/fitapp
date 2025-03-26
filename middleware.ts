import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up', '/forgot-password'];
  
  // Protected routes that require authentication
  const protectedRoutes = ['/profile', '/workouts', '/routines', '/protected'];
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, let the client-side handle authentication
  if (isProtectedRoute) {
    // The actual authentication check will be done on the client side
    // using the AuthProvider context
    return NextResponse.next();
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/workouts/:path*',
    '/routines/:path*',
    '/protected/:path*',
    '/sign-in',
    '/sign-up',
    '/forgot-password'
  ]
};
