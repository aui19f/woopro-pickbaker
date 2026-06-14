import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/write"];
const AUTH_PATHS = ["/login", "/signup"]; // redirect to /feed if already logged in
const PUBLIC_EXACT = new Set(["/feed", "/offline", "/recipe"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { supabaseResponse, user } = await updateSession(request);

  // Already logged in → redirect away from auth pages
  if (AUTH_PATHS.includes(pathname) && user) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  const isPublicPath = PUBLIC_EXACT.has(pathname) || pathname === "/";

  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    /^\/offline\/.+/.test(pathname) ||
    /^\/recipe\/.+/.test(pathname) ||
    // /[username] (mypage) — anything not matching known public/auth routes
    (!isPublicPath &&
      !AUTH_PATHS.includes(pathname) &&
      pathname !== "/" &&
      /^\/[a-z0-9_]+$/.test(pathname));

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
