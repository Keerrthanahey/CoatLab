import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  createUser,
  emailExists,
  hashPassword,
  toPublicUser,
} from "@/lib/auth";

export const runtime = "nodejs";

interface SignupBody {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  domain?: string;
}

export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fullName = (body.fullName ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }
  if (emailExists(email)) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const user = createUser({
    fullName,
    email,
    passwordHash: hashPassword(password),
    domain: (body.domain ?? "").trim() || undefined,
  });

  const token = createSessionToken({
    userId: user.id,
    name: user.fullName,
    email: user.email,
  });

  const response = NextResponse.json(
    { user: toPublicUser(user) },
    { status: 201 },
  );

  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}
