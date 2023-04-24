import { NextRequest, NextResponse } from "next/server";
const isPasswordEnabled = !!process.env.PASSWORD_PROTECT
export async function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.has('login');
  if (isPasswordEnabled && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  return NextResponse.next()
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|favicon.ico|login).*)',
  ],
}