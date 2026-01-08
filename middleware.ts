import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Type declaration for atob (available in Edge runtime)
declare const atob: (str: string) => string;

// TypeScript interface for token claims
interface TokenClaims {
  exp?: number;
  admin?: boolean;
  role?: string;
  uid?: string;
  email?: string;
  [key: string]: unknown;
}

// Type for decode token result
interface DecodeTokenResult {
  claims?: TokenClaims;
  error?: string;
}

// Public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password"];

// Protected routes that require authentication
const protectedRoutes = ["/my-account", "/admin"];

// Admin-only routes
const adminRoutes = ["/admin"];

// Helper function to check if pathname matches route exactly or is a sub-route
// This prevents false matches like "/admin-test" matching "/admin"
function isRouteMatch(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

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
function decodeToken(token: string): DecodeTokenResult {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { error: "Invalid token format" };
    }

    const payload = parts[1];
    const decodedPayload = base64UrlDecode(payload);
    const decoded = JSON.parse(decodedPayload) as TokenClaims;

    return { claims: decoded };
  } catch (error) {
    return { error: "Failed to decode token" };
  }
}

// Helper function to check if token is expired
function isTokenExpired(claims: TokenClaims): boolean {
  if (!claims.exp) return true;
  const expirationTime = claims.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
}

// Helper function to check if user is admin
function isAdmin(claims: TokenClaims): boolean {
  return claims?.admin === true || claims?.role === "admin";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("firebase_token")?.value;

  // Log middleware execution start
  console.log("[Middleware] 🔄 Processing request:", {
    pathname,
    method: request.method,
    hasToken: !!token,
    timestamp: new Date().toISOString(),
  });

  // Check if the current path is a public route (exact match or sub-route)
  const isPublicRoute = publicRoutes.some((route) =>
    isRouteMatch(pathname, route)
  );

  // Check if the current path is a protected route (exact match or sub-route)
  const isProtectedRoute = protectedRoutes.some((route) =>
    isRouteMatch(pathname, route)
  );

  // Check if the current path is an admin route (exact match or sub-route)
  const isAdminRoute = adminRoutes.some((route) =>
    isRouteMatch(pathname, route)
  );

  // Log route classification
  console.log("[Middleware] 📍 Route classification:", {
    pathname,
    isPublicRoute,
    isProtectedRoute,
    isAdminRoute,
  });

  // If user is on a public route and has a valid token, redirect to home
  if (isPublicRoute && token) {
    console.log("[Middleware] 🔐 Public route with token - validating...");
    try {
      const { claims, error } = decodeToken(token);
      if (!error && claims && !isTokenExpired(claims)) {
        // User is authenticated, redirect away from auth pages
        console.log("[Middleware] ✅ Authenticated user on public route - redirecting to home");
        return NextResponse.redirect(new URL("/", request.url));
      } else {
        console.log("[Middleware] ⚠️ Token invalid or expired on public route - allowing access");
      }
    } catch (error) {
      // If token is invalid, allow access to public routes
      console.error("[Middleware] ❌ Error validating token on public route:", error);
    }
  }

  // If user is on a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    console.log("[Middleware] 🚫 Protected route without token - redirecting to login");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    console.log("[Middleware] 🔀 Redirect:", {
      from: pathname,
      to: loginUrl.toString(),
    });
    return NextResponse.redirect(loginUrl);
  }

  // If user has a token, verify it's valid
  if (isProtectedRoute && token) {
    console.log("[Middleware] 🔐 Protected route with token - validating...");
    try {
      const { claims, error } = decodeToken(token);

      // If token is invalid or expired, redirect to login
      if (error || !claims || isTokenExpired(claims)) {
        console.warn("[Middleware] ❌ Token validation failed:", {
          error,
          hasClaims: !!claims,
          isExpired: claims ? isTokenExpired(claims) : "unknown",
          pathname,
        });
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        console.log("[Middleware] 🔀 Redirect:", {
          from: pathname,
          to: loginUrl.toString(),
          reason: "invalid_or_expired_token",
        });
        return NextResponse.redirect(loginUrl);
      }

      console.log("[Middleware] ✅ Token valid:", {
        pathname,
        uid: claims.uid,
        email: claims.email,
        admin: claims.admin,
        role: claims.role,
      });

      // If accessing admin route, check admin status
      if (isAdminRoute && !isAdmin(claims)) {
        // User is authenticated but not admin, redirect to home
        console.warn("[Middleware] 🚫 Non-admin user attempted to access admin route:", {
          pathname,
          claims: { admin: claims.admin, role: claims.role },
        });
        console.log("[Middleware] 🔀 Redirect:", {
          from: pathname,
          to: "/",
          reason: "insufficient_permissions",
        });
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (isAdminRoute && isAdmin(claims)) {
        console.log("[Middleware] ✅ Admin access granted:", {
          pathname,
          admin: claims.admin,
          role: claims.role,
        });
      }
    } catch (error) {
      // If token decoding fails, redirect to login
      console.error("[Middleware] ❌ Token decoding error:", error);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      console.log("[Middleware] 🔀 Redirect:", {
        from: pathname,
        to: loginUrl.toString(),
        reason: "token_decode_error",
      });
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request to proceed
  console.log("[Middleware] ✅ Request allowed to proceed:", {
    pathname,
    routeType: isPublicRoute ? "public" : isProtectedRoute ? "protected" : "other",
  });
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

