import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expected = process.env.DASHBOARD_PASSWORD;

    if (!expected) {
      return NextResponse.json({ error: "DASHBOARD_PASSWORD not configured" }, { status: 500 });
    }

    if (password === expected) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("ruby-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
