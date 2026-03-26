const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type Entry = {
  count: number;
  expiresAt: number;
};

const store = new Map<string, Entry>();

function keyFor(email: string, ipAddress: string) {
  return `${email}:${ipAddress}`;
}

export function assertRateLimit(email: string, ipAddress: string) {
  const key = keyFor(email, ipAddress);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.expiresAt < now) {
    store.set(key, { count: 0, expiresAt: now + WINDOW_MS });
    return;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    throw new Error("Too many attempts. Please try again later.");
  }
}

export function registerFailedAttempt(email: string, ipAddress: string) {
  const key = keyFor(email, ipAddress);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.expiresAt < now) {
    store.set(key, { count: 1, expiresAt: now + WINDOW_MS });
    return;
  }

  store.set(key, { ...entry, count: entry.count + 1 });
}

export function clearAttempts(email: string, ipAddress: string) {
  store.delete(keyFor(email, ipAddress));
}
