import { NextResponse } from "next/server";
import { SESSION_COOKIE, getUserById, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

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

  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      domain: user.domain ?? null,
    },
  });
}
