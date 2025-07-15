// src/middleware.ts

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin"); // Assuming /admin is your protected area

  if (
    !user &&
    isAdminPath &&
    !request.nextUrl.pathname.startsWith("/auth/login") &&
    !request.nextUrl.pathname.startsWith("/auth/sign-up")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login"; // Redirect to your actual login page
    return NextResponse.redirect(url);
  }

  // If user IS logged in and tries to access /login or /signup, redirect them to /admin
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/auth/login") ||
      request.nextUrl.pathname.startsWith("/auth/sign-up"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin"; // Redirect to your admin dashboard
    return NextResponse.redirect(url);
  }

  return supabaseResponse; // Return the response with updated cookies
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any files in the /api folder (api routes)
     * - your public images folder (e.g., /images if you have one)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|images|.*\\..*).*)", // Exclude files with extensions (css, js, etc.)
  ],
};
