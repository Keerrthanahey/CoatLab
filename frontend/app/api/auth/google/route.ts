import { NextResponse } from "next/server";
import { buildGoogleAuthUrl, isGoogleConfigured } from "@/lib/auth/google";

export const runtime = "nodejs";

/**
 * Start Google Sign-In. Redirects to Google consent; the callback
 * (google/callback/route.ts) completes the flow and issues the session.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(
      new URL("/login?google=not_configured", origin),
    );
  }

  // Echo a validated return path through OAuth state so users land where they
  // started instead of always going back to the dashboard.
  const requestUrl = new URL(request.url);
  const nextParam = requestUrl.searchParams.get("next") ?? "/dashboard";
  const safeNext = nextParam.startsWith("/") && !nextParam.startsWith("//")
    ? nextParam
    : "/dashboard";

  const url = buildGoogleAuthUrl(origin, encodeURIComponent(safeNext));
  return NextResponse.redirect(url);
}