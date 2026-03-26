import { AuthError } from "@/modules/auth/domain/auth.errors";
import { findUserByEmail } from "@/modules/auth/infrastructure/user.repository";
import { verifyPassword } from "@/modules/auth/infrastructure/password-hasher";
import {
  assertRateLimit,
  clearAttempts,
  registerFailedAttempt,
} from "@/modules/auth/infrastructure/auth-rate-limiter";
import { validateLoginInput } from "@/modules/auth/validation/login-input.validator";
import {
  createSessionToken,
  SESSION_CONFIG,
  sessionCookieOptions,
} from "@/shared/auth/session-token";

type LoginRequest = {
  email?: unknown;
  password?: unknown;
  rememberMe?: unknown;
  ipAddress: string;
};

export async function executeLogin(request: LoginRequest) {
  const validated = validateLoginInput(request);

  try {
    assertRateLimit(validated.email, request.ipAddress);
  } catch {
    throw new AuthError("Too many failed login attempts. Try again later.", 429);
  }

  const user = await findUserByEmail(validated.email);

  if (!user || !user.isActive || !verifyPassword(validated.password, user.passwordHash)) {
    registerFailedAttempt(validated.email, request.ipAddress);
    throw new AuthError("Invalid email or password.", 401);
  }

  clearAttempts(validated.email, request.ipAddress);

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const maxAge = validated.rememberMe
    ? SESSION_CONFIG.thirtyDaysSeconds
    : SESSION_CONFIG.oneDaySeconds;

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: nowInSeconds,
    exp: nowInSeconds + maxAge,
  });

  return {
    token,
    cookie: sessionCookieOptions(validated.rememberMe),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}
