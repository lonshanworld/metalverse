export type AppDataMode = "mock" | "api";

export function getAppDataMode(): AppDataMode {
  const raw = (process.env.APP_DATA_MODE ?? process.env.NEXT_PUBLIC_APP_DATA_MODE ?? "mock")
    .trim()
    .toLowerCase();
  return raw === "api" ? "api" : "mock";
}

export function isMockMode() {
  return getAppDataMode() === "mock";
}

export function getBackendBaseUrl() {
  return process.env.AUTH_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
}

