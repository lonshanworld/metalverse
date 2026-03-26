import { NextRequest, NextResponse } from "next/server";
import { executeLogout } from "@/modules/auth/application/logout.use-case";
import { BACKEND_ACCESS_TOKEN_COOKIE } from "@/shared/auth/backend-access-token";

function isSecureRequest(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim() === "https";
  }
  return request.nextUrl.protocol === "https:";
}

export async function POST(request: NextRequest) {
  const cookie = executeLogout();
  const secure = isSecureRequest(request);
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: cookie.name,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: cookie.maxAge,
  });
  response.cookies.set({
    name: BACKEND_ACCESS_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });

  return response;
}
