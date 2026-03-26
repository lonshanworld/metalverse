export type UserRole = "admin" | "member";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
  exp: number;
  iat: number;
};

export type LoginInput = {
  email: string;
  password: string;
  rememberMe: boolean;
  ipAddress: string;
};
