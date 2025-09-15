import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function adminMiddleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Check if user is authenticated and has admin role
  if (!token || token.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized: Admin access required' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  return NextResponse.next();
}