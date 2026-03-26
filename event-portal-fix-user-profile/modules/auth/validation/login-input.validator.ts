import { AuthError } from "@/modules/auth/domain/auth.errors";

type RawLoginInput = {
  email?: unknown;
  password?: unknown;
  rememberMe?: unknown;
};

export function validateLoginInput(raw: RawLoginInput) {
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const password = typeof raw.password === "string" ? raw.password : "";
  const rememberMe = Boolean(raw.rememberMe);

  if (!email || !password) {
    throw new AuthError("Email and password are required.", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AuthError("Invalid email format.", 400);
  }

  if (password.length < 8 || password.length > 128) {
    throw new AuthError("Password must be between 8 and 128 characters.", 400);
  }

  return {
    email,
    password,
    rememberMe,
  };
}
