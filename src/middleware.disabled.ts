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
  
  // Debug: Log cookie names
  console.log("[Middleware] Cookie names:", req.cookies.getAll().map(c => c.name));
  
  // Check for token in cookies with different possible names
  const token = 
    req.cookies.get("token")?.value || 
    req.cookies.get("accessToken")?.value;
  
  // Debug: Log token from cookies
  console.log("[Middleware] Token from cookies:", token);
  
  // Check for token in localStorage via a custom header
  // Note: This won't work directly as middleware runs on the server
  // but we're covering all bases
  const localStorageToken = req.headers.get("x-access-token");
  
  // Debug: Log token from header
  console.log("[Middleware] Token from x-access-token header:", localStorageToken);
  
  // Check for Authorization header
  const authHeader = req.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") 
    ? authHeader.substring(7) 
    : null;
  
  // Debug: Log token from Authorization header
  console.log("[Middleware] Token from Authorization header:", bearerToken);
  
  // Determine if user is authenticated
  const isAuthenticated = !!(token || localStorageToken || bearerToken);
  const isPublic = publicRoutes.includes(pathname);

  // Debug: Log authentication status and path info
  console.log("[Middleware] Path:", pathname);
  console.log("[Middleware] Is public route:", isPublic);
  console.log("[Middleware] Is authenticated:", isAuthenticated);

  // Handle unauthenticated users trying to access protected routes
  if (!isAuthenticated && !isPublic) {
    console.log("[Middleware] Redirecting unauthenticated user to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Handle authenticated users trying to access public routes
  if (isAuthenticated && isPublic) {
    console.log("[Middleware] Redirecting authenticated user to dashboard");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow the request to proceed
  console.log("[Middleware] Allowing request to proceed");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
