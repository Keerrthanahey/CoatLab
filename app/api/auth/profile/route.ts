import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getUserById,
  toPublicUser,
  updateUserProfile,
  verifySessionToken,
} from "@/lib/auth";

export const runtime = "nodejs";

interface ProfileBody {
  fullName?: string;
  domain?: string;
}

/**
 * Update editable profile fields (full name, research domain) for the
 * authenticated user.
 */
export async function PATCH(request: Request) {
  const token = request.headers.get("cookie") ?? "";
  const session = verifySessionToken(
    token
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1),
  );

  if (!session) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  let body: ProfileBody;
  try {
    body = (await request.json()) as ProfileBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fullName = (body.fullName ?? "").trim();
  if (!fullName) {
    return NextResponse.json(
      { error: "Full name is required." },
      { status: 400 },
    );
  }

  const user = updateUserProfile(session.userId, {
    fullName,
    domain: body.domain !== undefined ? body.domain.trim() : undefined,
  });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user: toPublicUser(user) });
}

/** Also allow the profile to be read directly. */
export async function GET(request: Request) {
  const token = request.headers.get("cookie") ?? "";
  const session = verifySessionToken(
    token
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1),
  );

  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user: toPublicUser(user) });
}