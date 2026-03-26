import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(plainText: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(plainText, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${key}`;
}

export function verifyPassword(plainText: string, storedHash: string): boolean {
  const [salt, savedKey] = storedHash.split(":");

  if (!salt || !savedKey) {
    return false;
  }

  const calculatedKey = scryptSync(plainText, salt, KEY_LENGTH);
  const savedBuffer = Buffer.from(savedKey, "hex");

  if (savedBuffer.length !== calculatedKey.length) {
    return false;
  }

  return timingSafeEqual(savedBuffer, calculatedKey);
}
