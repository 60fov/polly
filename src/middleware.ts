import { NextRequest, NextResponse } from "next/server";

const isPasswordEnabled = !!process.env.PASSWORD_PROTECT

export async function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.has('login');
  
  console.log("isLogged", isLoggedIn)
  
  if (isPasswordEnabled && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|favicon.ico|login).*)',
  ],
}