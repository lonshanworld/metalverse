import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
} from "@/shared/auth/session-token";
import { BACKEND_ACCESS_TOKEN_COOKIE } from "@/shared/auth/backend-access-token";
import { getAppDataMode, getBackendBaseUrl } from "@/shared/config/data-mode";
import { ApiResponse } from "@/shared/types/http";

const MOCK_BACKEND_ACCESS_TOKEN = "mock-backend-access-token";

function isSecureRequest(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim() === "https";
  }
  return request.nextUrl.protocol === "https:";
}

function parseEmail(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
}

function parsePassword(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function inferName(email: string) {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = parseEmail((body as Record<string, unknown>)?.email);
    const password = parsePassword((body as Record<string, unknown>)?.password);

    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Please provide a valid email.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Password must be at least 8 characters.",
        },
        { status: 400 },
      );
    }

    const mode = getAppDataMode();
    let userId = crypto.randomUUID();
    let userName = inferName(email);
    let backendAccessToken = MOCK_BACKEND_ACCESS_TOKEN;

    if (mode === "api") {
      const backendResponse = await fetch(`${getBackendBaseUrl()}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });

      const backendPayload = await backendResponse.json().catch(() => null);
      if (!backendResponse.ok || !backendPayload) {
        const backendError =
          backendPayload && typeof backendPayload.error === "string"
            ? backendPayload.error
            : "Unable to sign up.";
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: backendError },
          { status: backendResponse.status || 400 },
        );
      }

      const payloadRecord = backendPayload as Record<string, unknown>;
      const dataRecord =
        payloadRecord.data && typeof payloadRecord.data === "object"
          ? (payloadRecord.data as Record<string, unknown>)
          : {};
      const userRecord =
        payloadRecord.user && typeof payloadRecord.user === "object"
          ? (payloadRecord.user as Record<string, unknown>)
          : dataRecord.user && typeof dataRecord.user === "object"
            ? (dataRecord.user as Record<string, unknown>)
            : {};

      const tokenFromPayload =
        (typeof payloadRecord.token === "string" && payloadRecord.token) ||
        (typeof dataRecord.token === "string" && dataRecord.token) ||
        "";
      backendAccessToken = tokenFromPayload || MOCK_BACKEND_ACCESS_TOKEN;

      const userIdFromPayload =
        (typeof userRecord.user_id === "string" && userRecord.user_id) ||
        (typeof userRecord.id === "string" && userRecord.id) ||
        "";
      const userNameFromPayload =
        (typeof userRecord.first_name === "string" && userRecord.first_name) ||
        (typeof userRecord.name === "string" && userRecord.name) ||
        (typeof userRecord.username === "string" && userRecord.username) ||
        "";

      if (userIdFromPayload) {
        userId = userIdFromPayload;
      }
      if (userNameFromPayload) {
        userName = userNameFromPayload;
      }
    }

    const rememberMe = true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const cookie = sessionCookieOptions(rememberMe);
    const token = await createSessionToken({
      sub: userId,
      email,
      name: userName,
      role: "member",
      iat: nowInSeconds,
      exp: nowInSeconds + cookie.maxAge,
    });

    const secure = isSecureRequest(request);
    const responsePayload: ApiResponse<{
      user: { id: string; email: string; name: string; role: "member" };
      backendAccessToken: string;
    }> = {
      success: true,
      data: {
        user: {
          id: userId,
          email,
          name: userName,
          role: "member",
        },
        backendAccessToken,
      },
    };

    const response = NextResponse.json(responsePayload, { status: 200 });
    response.cookies.set({
      name: cookie.name,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: cookie.maxAge,
    });
    response.cookies.set({
      name: BACKEND_ACCESS_TOKEN_COOKIE,
      value: backendAccessToken,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: cookie.maxAge,
    });

    return response;
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Unable to sign up.",
      },
      { status: 500 },
    );
  }
}
