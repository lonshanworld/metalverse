import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, sessionCookieOptions, SESSION_CONFIG, verifySessionToken } from "@/shared/auth/session-token";
import { BACKEND_ACCESS_TOKEN_COOKIE } from "@/shared/auth/backend-access-token";

function inferNameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  if (!local) {
    return "Member";
  }
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_CONFIG.cookieName)?.value ?? "";
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: session.sub,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token : "";
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
    }

    // Attempt to decode the JWT payload smoothly to populate the session
    let userId = "resolved-user-id";
    let userEmail = "resolved-user-email";
    let userName = "Member";

    const providedUser = body?.user && typeof body.user === "object" ? body.user as Record<string, unknown> : null;
    if (providedUser) {
      if (typeof providedUser.id === "string" && providedUser.id) userId = providedUser.id;
      if (typeof providedUser.email === "string" && providedUser.email) userEmail = providedUser.email;
      if (typeof providedUser.name === "string" && providedUser.name) userName = providedUser.name;
    }

    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadStr = Buffer.from(parts[1], "base64").toString("utf-8");
        const payload = JSON.parse(payloadStr);

        userId = payload.user_id || payload.sub || userId;
        userEmail = payload.email || userEmail;
        userName = payload.name || payload.first_name || userName;
      }
    } catch {
      // Just fallback to default strings if decoding fails
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const cookie = sessionCookieOptions(true);
    const sessionToken = await createSessionToken({
      sub: userId,
      email: userEmail,
      name: userName || inferNameFromEmail(userEmail),
      role: "member",
      iat: nowInSeconds,
      exp: nowInSeconds + cookie.maxAge,
    });

    const secure = request.nextUrl.protocol === "https:";
    const nextResponse = NextResponse.json({ success: true, data: { backendAccessToken: token } }, { status: 200 });
    
    // Cookie required for the middleware router
    nextResponse.cookies.set({
      name: cookie.name,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: cookie.maxAge,
    });

    // Mirroring what the main login route offers
    nextResponse.cookies.set({
      name: BACKEND_ACCESS_TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: cookie.maxAge,
    });

    return nextResponse;
  } catch (error) {
    console.error("Failed to create session:", error); 
    
    return NextResponse.json({ success: false, error: "Session creation error" }, { status: 500 });
  }
}
