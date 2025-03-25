import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function getTokenFromHeader(): Promise<string | null> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

export async function verifyToken(token: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return { user: null, error };
    }
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export function extractTokenData(token: string) {
  try {
    // JWT tokens are base64 encoded in three parts: header.payload.signature
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    return {
      exp: decodedPayload.exp,
      sub: decodedPayload.sub,
      email: decodedPayload.email,
      role: decodedPayload.role
    };
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const data = extractTokenData(token);
  if (!data?.exp) return true;
  
  // Check if the token has expired (exp is in seconds)
  return Date.now() >= data.exp * 1000;
} 