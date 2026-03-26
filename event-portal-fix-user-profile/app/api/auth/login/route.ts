import { NextRequest, NextResponse } from "next/server";
import { AuthError } from "@/modules/auth/domain/auth.errors";
import { validateLoginInput } from "@/modules/auth/validation/login-input.validator";
import {
  createSessionToken,
  sessionCookieOptions,
} from "@/shared/auth/session-token";
import { BACKEND_ACCESS_TOKEN_COOKIE } from "@/shared/auth/backend-access-token";
import { getAppDataMode, getBackendBaseUrl } from "@/shared/config/data-mode";
import { ApiResponse } from "@/shared/types/http";

const MOCK_BACKEND_ACCESS_TOKEN = "mock-backend-access-token";

type MockLoginUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "member";
};

const MOCK_LOGIN_USERS: MockLoginUser[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    email: "admin@medalverse.io",
    password: "P@ssword123",
    name: "Admin",
    role: "admin",
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    email: "member@medalverse.io",
    password: "P@ssword123",
    name: "Member",
    role: "member",
  },
];

function isEnabled(value?: string) {
  return value?.trim().toLowerCase() === "true";
}

function isSecureRequest(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim() === "https";
  }
  return request.nextUrl.protocol === "https:";
}

function toRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value) {
      return value;
    }
  }
  return fallback;
}

function isLocalDevelopmentRequest(request: NextRequest) {
  const host = request.headers.get("host") ?? request.nextUrl.host ?? "";
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

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

function buildDisplayNameFromUserRecord(
  user: Record<string, unknown>,
  fallbackEmail: string,
  fallbackName: string,
) {
  const firstName = readString(user, ["first_name"], "");
  const lastName = readString(user, ["last_name"], "");
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;

  const fromUser = readString(user, ["name", "username"], "");
  if (fromUser) return fromUser;

  return fallbackName || inferNameFromEmail(fallbackEmail);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = validateLoginInput(body);

    const mode = getAppDataMode();
    const allowProdMockLogin = isEnabled(process.env.ENABLE_PROD_MOCK_LOGIN);
    const matchedMockUser = MOCK_LOGIN_USERS.find(
      (mockUser) =>
        mockUser.email.toLowerCase() === validated.email.toLowerCase() &&
        mockUser.password === validated.password,
    );

    let userId = MOCK_LOGIN_USERS[0].id;
    let userEmail = MOCK_LOGIN_USERS[0].email;
    let userName = MOCK_LOGIN_USERS[0].name;
    let role: "admin" | "member" = MOCK_LOGIN_USERS[0].role;
    let backendAccessToken = MOCK_BACKEND_ACCESS_TOKEN;

    if (isLocalDevelopmentRequest(request) && mode !== "api") {
      // Local-only shortcut when not using the real API (mock / dev convenience).
      userId = crypto.randomUUID();
      userEmail = validated.email;
      userName = inferNameFromEmail(validated.email);
      role = "member";
      backendAccessToken = MOCK_BACKEND_ACCESS_TOKEN;
    } else if (mode === "mock") {
      if (!matchedMockUser) {
        throw new AuthError("Invalid email or password.", 401);
      }

      userId = matchedMockUser.id;
      userEmail = matchedMockUser.email;
      userName = matchedMockUser.name;
      role = matchedMockUser.role;
    } else if (allowProdMockLogin && matchedMockUser) {
      userId = matchedMockUser.id;
      userEmail = matchedMockUser.email;
      userName = matchedMockUser.name;
      role = matchedMockUser.role;
    } else {
      const backendResponse = await fetch(`${getBackendBaseUrl()}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: validated.email,
          password: validated.password,
        }),
        cache: "no-store",
      });

      const backendPayload = await backendResponse.json().catch(() => null);
      if (!backendResponse.ok || !backendPayload) {
        const payloadRecord = toRecord(backendPayload);
        const backendError =
          payloadRecord && typeof payloadRecord.error === "string" ? payloadRecord.error : "Invalid email or password.";
        throw new AuthError(backendError, backendResponse.status || 401);
      }

      const payloadRecord = toRecord(backendPayload) ?? {};
      const nestedData = toRecord(payloadRecord.data) ?? {};
      const user = (toRecord(payloadRecord.user) ?? toRecord(nestedData.user)) ?? {};

      backendAccessToken = readString(payloadRecord, ["token"], "") || readString(nestedData, ["token"], "");
      if (!backendAccessToken) {
        throw new AuthError("Backend token missing from login response.", 502);
      }

      userId = readString(user, ["user_id", "id"], userId);
      userEmail = readString(user, ["email"], validated.email);
      userName = buildDisplayNameFromUserRecord(user, validated.email, inferNameFromEmail(validated.email));
      role = "member";
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const cookie = sessionCookieOptions(validated.rememberMe);
    const token = await createSessionToken({
      sub: userId,
      email: userEmail,
      name: userName,
      role,
      iat: nowInSeconds,
      exp: nowInSeconds + cookie.maxAge,
    });

    const response: ApiResponse<{
      user: {
        id: string;
        email: string;
        name: string;
        role: "admin" | "member";
      };
      backendAccessToken?: string;
    }> = {
      success: true,
      data: {
        user: {
          id: userId,
          email: userEmail,
          name: userName,
          role,
        },
        backendAccessToken,
      },
    };

    const secure = isSecureRequest(request);
    const nextResponse = NextResponse.json(response, { status: 200 });
    nextResponse.cookies.set({
      name: cookie.name,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: cookie.maxAge,
    });
    nextResponse.cookies.set({
      name: BACKEND_ACCESS_TOKEN_COOKIE,
      value: backendAccessToken,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: cookie.maxAge,
    });

    return nextResponse;
  } catch (error) {
    const known = error instanceof AuthError;
    const response: ApiResponse<never> = {
      success: false,
      error: known ? error.message : "Unable to sign in.",
    };

    return NextResponse.json(response, {
      status: known ? error.statusCode : 500,
    });
  }
}
