import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  attachGoogleIdentity,
  createUser,
  getUserByEmail,
} from "@/lib/auth";
import { exchangeGoogleCode, isGoogleConfigured } from "@/lib/auth/google";

export const runtime = "nodejs";

function fail(origin: string, reason: "error" | "not_configured") {
  return NextResponse.redirect(
    new URL(`/login?google=${reason}`, origin),
  );
}

/**
 * Finish Google Sign-In. Exchange the authorization code for the verified
 * profile, upsert the user in the local store, and issue a CoatLab session
 * cookie exactly like email/password login.
 */
export async function GET(request: NextRequest) {
  const { origin } = request.nextUrl;
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const rawState = request.nextUrl.searchParams.get("state") ?? "";

  if (error || !code || !isGoogleConfigured()) {
    return fail(origin, "error");
  }

  // Re-hydrate the return path we put into OAuth state.
  let requestedNext = "/dashboard";
  try {
    const decoded = decodeURIComponent(rawState);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      requestedNext = decoded;
    }
  } catch {
    // Malformed state — fall back to the dashboard.
  }
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/dashboard";

  try {
    const profile = await exchangeGoogleCode(code, origin);
    if (!profile.emailVerified) return fail(origin, "error");

    let user = getUserByEmail(profile.email);
    if (!user) {
      user = createUser({
        fullName: profile.name,
        email: profile.email,
        provider: "google",
        avatarUrl: profile.picture,
      });
    } else {
      const updated = attachGoogleIdentity(user.id, {
        name: profile.name,
        avatarUrl: profile.picture,
      });
      if (updated) user = updated;
    }

    const token = createSessionToken({
      userId: user.id,
      name: user.fullName,
      email: user.email,
    });

    const res = NextResponse.redirect(new URL(next, origin));
    res.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return res;
  } catch {
    return fail(origin, "error");
  }
}