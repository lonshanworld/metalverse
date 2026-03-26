import { BACKEND_ACCESS_TOKEN_STORAGE } from "@/shared/auth/backend-access-token";

export function readBackendAccessToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(BACKEND_ACCESS_TOKEN_STORAGE) ?? "";
}

export function writeBackendAccessToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }
  if (!token) {
    window.localStorage.removeItem(BACKEND_ACCESS_TOKEN_STORAGE);
    return;
  }
  window.localStorage.setItem(BACKEND_ACCESS_TOKEN_STORAGE, token);
}

export function clearBackendAccessToken() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(BACKEND_ACCESS_TOKEN_STORAGE);
}

export function withBackendAuthHeaders(headers?: HeadersInit): HeadersInit {
  const token = readBackendAccessToken();
  if (!token) {
    return headers ?? {};
  }
  return {
    ...(headers ?? {}),
    Authorization: `Bearer ${token}`,
  };
}
