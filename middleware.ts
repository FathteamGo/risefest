import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // only guard /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const token = req.cookies.get('adminToken')?.value || '';
  const onLogin = pathname === '/admin/login';

  // not authed -> force to /admin/login
  if (!token && !onLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
    return NextResponse.redirect(url);
  }

  // already authed but trying to open /admin/login -> send to /admin/events
  if (token && onLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/events';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
