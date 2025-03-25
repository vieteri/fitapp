import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const cookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/'
};

export const setAuthCookies = (accessToken: string, refreshToken: string) => {
  const cookieStore = cookies();
  
  // Set access token
  cookieStore.set({
    name: 'access_token',
    value: accessToken,
    ...cookieOptions
  });
  
  // Set refresh token with restricted path
  cookieStore.set({
    name: 'refresh_token',
    value: refreshToken,
    ...cookieOptions,
    path: '/api/auth/refresh' // Restrict refresh token to refresh endpoint
  });
};

export const clearAuthCookies = () => {
  const cookieStore = cookies();
  
  // Clear both tokens by setting them to expire immediately
  cookieStore.set({
    name: 'access_token',
    value: '',
    ...cookieOptions,
    maxAge: 0
  });
  cookieStore.set({
    name: 'refresh_token',
    value: '',
    ...cookieOptions,
    maxAge: 0
  });
};

export const getAuthToken = () => {
  const cookieStore = cookies();
  return cookieStore.get('access_token')?.value;
};

export const getRefreshToken = () => {
  const cookieStore = cookies();
  return cookieStore.get('refresh_token')?.value;
}; 