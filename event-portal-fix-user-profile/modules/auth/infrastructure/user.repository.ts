import { hashPassword } from "@/modules/auth/infrastructure/password-hasher";

const seedPassword = hashPassword("P@ssword123");

const users = [
  {
    id: "usr_admin_001",
    email: "admin@medalverse.io",
    name: "Platform Admin",
    role: "admin" as const,
    passwordHash: seedPassword,
    isActive: true,
  },
];

export async function findUserByEmail(email: string) {
  return users.find((user) => user.email === email) ?? null;
}
