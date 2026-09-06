import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  getUserByEmail,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";

interface LoginBody {
  email?: string;
  password?: string;
  remember?: boolean;
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const token = createSessionToken({
    userId: user.id,
    name: user.fullName,
    email: user.email,
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      domain: user.domain ?? null,
    },
  });

  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // "Remember me" persists for the full session TTL; otherwise a shorter
    // browser-session cookie is used and cleared when the browser closes.
    maxAge: body.remember === false ? undefined : SESSION_TTL_SECONDS,
  });

  return response;
}
