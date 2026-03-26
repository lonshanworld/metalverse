import { SessionPayload } from "@/modules/auth/domain/auth.types";

const SESSION_COOKIE = "mv_session";
const ONE_DAY_SECONDS = 60 * 60 * 24;
const THIRTY_DAYS_SECONDS = ONE_DAY_SECONDS * 30;

function getSecret() {
  return process.env.AUTH_SECRET ?? "dev-only-auth-secret-change-in-production";
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function base64UrlEncode(bytes: Uint8Array) {
  return toBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return fromBase64(padded);
}

async function sign(value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

async function verify(value: string, signature: string) {
  const expected = await sign(value);
  return expected === signature;
}

export function sessionCookieOptions(rememberMe: boolean) {
  return {
    name: SESSION_COOKIE,
    maxAge: rememberMe ? THIRTY_DAYS_SECONDS : ONE_DAY_SECONDS,
  };
}

export async function createSessionToken(payload: SessionPayload) {
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return null;
  }

  const isValid = await verify(payloadPart, signaturePart);
  if (!isValid) {
    return null;
  }

  try {
    const payloadString = new TextDecoder().decode(base64UrlDecode(payloadPart));
    const payload = JSON.parse(payloadString) as SessionPayload;

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export const SESSION_CONFIG = {
  cookieName: SESSION_COOKIE,
  oneDaySeconds: ONE_DAY_SECONDS,
  thirtyDaysSeconds: THIRTY_DAYS_SECONDS,
};
