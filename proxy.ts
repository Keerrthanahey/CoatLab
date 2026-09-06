import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Server-side route guarding.
 *
 * Proxy runs before routes render. It performs coarse authentication gating:
 *  - unauthenticated users hitting a protected area are sent to /login
 *  - authenticated users hitting /login or /signup are sent to /dashboard
 *
 * The session token is stateless and HMAC-signed (see lib/auth/session.ts),
 * so this works without any database or shared store.
 *
 * Note: proxy is first-line defense, not the only one — the auth context and
 * route handlers independently validate the session on every interaction.
 */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/prediction",
  "/microstructure",
  "/literature",
  "/dataset",
  "/model",
  "/materials",
  "/settings",
  "/ml",
];

const AUTH_ROUTES = ["/login", "/signup"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  const isAuthed = Boolean(session);

  if (isProtected(pathname) && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute(pathname) && isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run proxy on app routes only — skip API routes, static assets and
     * framework metadata files. API routes have their own validation.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt).*)",
  ],
};
