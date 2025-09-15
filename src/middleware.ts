import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  
  // Protected routes that require authentication
  const protectedPaths = [
    '/buyers',
    '/buyers/new',
    '/api/buyers',
  ];
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(`${path}/`)
  );
  
  // Admin-only routes
  const adminPaths = [
    '/admin',
    '/api/admin',
  ];
  
  const isAdminPath = adminPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(`${path}/`)
  );
  
  // Redirect to login if accessing protected route without authentication
  if (isProtectedPath && !isAuthenticated) {
    const redirectUrl = new URL('/api/auth/signin', request.url);
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Check admin access for admin routes
  if (isAdminPath) {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const redirectUrl = new URL('/api/auth/signin', request.url);
      redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // If authenticated but not admin, redirect to home or return 403
    if (token.role !== 'ADMIN') {
      // For API routes, return 403 Forbidden
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized: Admin access required' }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      // For page routes, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    '/buyers/:path*',
    '/api/buyers/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};