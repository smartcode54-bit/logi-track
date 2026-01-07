import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Type declaration for atob (available in Edge runtime)
declare const atob: (str: string) => string;

// Public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password"];

// Protected routes that require authentication
const protectedRoutes = ["/my-account", "/admin"];

// Admin-only routes
const adminRoutes = ["/admin"];

// Helper function to decode base64url (Edge runtime compatible)
function base64UrlDecode(str: string): string {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  
  // Add padding if needed
  while (base64.length % 4) {
    base64 += "=";
  }
  
  // Decode using atob (available in Edge runtime)
  try {
    return atob(base64);
  } catch (error) {
    throw new Error("Failed to decode base64");
  }
}

// Helper function to decode JWT token (basic decoding without verification)
// Note: Full verification happens server-side, this is just for routing decisions
function decodeToken(token: string): { claims?: any; error?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { error: "Invalid token format" };
    }

    const payload = parts[1];
    const decodedPayload = base64UrlDecode(payload);
    const decoded = JSON.parse(decodedPayload);

    return { claims: decoded };
  } catch (error) {
    return { error: "Failed to decode token" };
  }
}

// Helper function to check if token is expired
function isTokenExpired(claims: any): boolean {
  if (!claims.exp) return true;
  const expirationTime = claims.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
}

// Helper function to check if user is admin
function isAdmin(claims: any): boolean {
  return claims?.admin === true || claims?.role === "admin";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("firebase_token")?.value;

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If user is on a public route and has a valid token, redirect to home
  if (isPublicRoute && token) {
    try {
      const { claims, error } = decodeToken(token);
      if (!error && claims && !isTokenExpired(claims)) {
        // User is authenticated, redirect away from auth pages
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // If token is invalid, allow access to public routes
    }
  }

  // If user is on a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user has a token, verify it's valid
  if (isProtectedRoute && token) {
    try {
      const { claims, error } = decodeToken(token);

      // If token is invalid or expired, redirect to login
      if (error || !claims || isTokenExpired(claims)) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // If accessing admin route, check admin status
      if (isAdminRoute && !isAdmin(claims)) {
        // User is authenticated but not admin, redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // If token decoding fails, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

