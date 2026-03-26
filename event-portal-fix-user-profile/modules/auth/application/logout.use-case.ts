import { SESSION_CONFIG } from "@/shared/auth/session-token";

export function executeLogout() {
  return {
    name: SESSION_CONFIG.cookieName,
    maxAge: 0,
  };
}
