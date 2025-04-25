// ✅ File: src/middleware.ts

import { NextRequest, NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/"];

// Define static assets and API routes that should bypass middleware
const bypassRoutes = [
  "/_next",
  "/api/",
  "/favicon.ico",
  "/static",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for static assets and API routes
  if (bypassRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check for token in cookies with different possible names
  const token = 
    req.cookies.get("token")?.value || 
    req.cookies.get("accessToken")?.value;
  
  // Check if the user is authenticated and trying to access login/register page
  const isAuthenticated = !!token;
  
  // Only redirect from login/register to dashboard if authenticated
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  
  // Handle unauthenticated users trying to access protected routes
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};