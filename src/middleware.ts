import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Fallback timeout in ms to prevent 504 MIDDLEWARE_INVOCATION_TIMEOUT
// if Supabase is paused, unreachable, or slow to respond.
const SUPABASE_AUTH_TIMEOUT_MS = 2500;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase environment variables are missing, proceed without throwing
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // Only run session refresh if auth cookies exist to avoid unnecessary
  // network calls for unauthenticated public visitors
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some((cookie) =>
    cookie.name.startsWith("sb-") || cookie.name.includes("auth-token")
  );

  if (!hasAuthCookie) {
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh session if expired, with a hard timeout and error fallback
    await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Supabase auth check timed out")),
          SUPABASE_AUTH_TIMEOUT_MS
        )
      ),
    ]);
  } catch (error) {
    // If Supabase is paused, timed out, or unreachable, do not crash the request with a 504.
    // Allow the request to proceed to the page gracefully.
    console.warn("Middleware Supabase auth refresh failed or timed out:", error);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
