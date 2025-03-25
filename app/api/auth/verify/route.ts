import { verifyJWT } from '@/utils/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const result = await verifyJWT(request.headers.get('authorization'));

  if ('error' in result) {
    return NextResponse.json(
      { valid: false, error: result.error },
      { status: result.status }
    );
  }

  const { user } = result;
  return NextResponse.json({
    valid: true,
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    }
  });
}