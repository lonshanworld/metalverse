import { NextRequest, NextResponse } from "next/server";
import { BACKEND_ACCESS_TOKEN_COOKIE } from "@/shared/auth/backend-access-token";
import { getAppDataMode, getBackendBaseUrl } from "@/shared/config/data-mode";

type BookmarkStore = {
  map: Map<string, Set<string>>;
};

declare global {
  var __mvBookmarkStore: BookmarkStore | undefined;
}

function getStore() {
  if (!globalThis.__mvBookmarkStore) {
    globalThis.__mvBookmarkStore = { map: new Map() };
  }
  return globalThis.__mvBookmarkStore;
}

function readBackendToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }
  return request.cookies.get(BACKEND_ACCESS_TOKEN_COOKIE)?.value ?? "";
}

type AnyRecord = Record<string, unknown>;

function toRecord(value: unknown): AnyRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as AnyRecord;
}

function extractItems(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }
  const root = toRecord(payload);
  if (!root) {
    return [];
  }
  if (Array.isArray(root.data)) {
    return root.data;
  }
  const nested = toRecord(root.data);
  if (nested && Array.isArray(nested.data)) {
    return nested.data;
  }
  if (nested && Array.isArray(nested.bookmarks)) {
    return nested.bookmarks;
  }
  if (nested && Array.isArray(nested.items)) {
    return nested.items;
  }
  return [];
}

function extractEventId(item: unknown) {
  const record = toRecord(item);
  if (!record) {
    return "";
  }
  if (typeof record.event_id === "string") {
    return record.event_id;
  }
  if (typeof record.eventId === "string") {
    return record.eventId;
  }
  const event = toRecord(record.event);
  if (event) {
    if (typeof event.event_id === "string") {
      return event.event_id;
    }
    if (typeof event.id === "string") {
      return event.id;
    }
  }
  return "";
}

function extractBookmarked(payload: unknown) {
  const root = toRecord(payload);
  if (!root) {
    return null;
  }
  if (typeof root.bookmarked === "boolean") {
    return root.bookmarked;
  }
  if (typeof root.is_bookmarked === "boolean") {
    return root.is_bookmarked;
  }
  const data = toRecord(root.data);
  if (!data) {
    return null;
  }
  if (typeof data.bookmarked === "boolean") {
    return data.bookmarked;
  }
  if (typeof data.is_bookmarked === "boolean") {
    return data.is_bookmarked;
  }
  return null;
}

async function tryGetBookmarks(authToken: string) {
  const candidates = [
    "/api/v1/event-bookmarks",
    "/api/v1/events/bookmarks",
    "/api/v1/events/bookmarks/me",
  ];
  for (const path of candidates) {
    const response = await fetch(`${getBackendBaseUrl()}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-store",
    });
    if (response.ok) {
      return response;
    }
    if (response.status === 404 || response.status === 405) {
      continue;
    }
    return response;
  }
  return null;
}

async function tryToggleBookmark(authToken: string, eventId: string) {
  const attempts: Array<{ method: "POST" | "PUT"; path: string; body?: Record<string, string> }> = [
    { method: "POST", path: "/api/v1/event-bookmarks/toggle", body: { event_id: eventId } },
    { method: "POST", path: "/api/v1/event-bookmarks/toggle", body: { eventId } },
    { method: "POST", path: "/api/v1/event-bookmarks", body: { event_id: eventId } },
    { method: "POST", path: "/api/v1/event-bookmarks", body: { eventId } },
    { method: "POST", path: "/api/v1/events/bookmarks/toggle", body: { event_id: eventId } },
    { method: "POST", path: "/api/v1/events/bookmarks/toggle", body: { eventId } },
    { method: "POST", path: "/api/v1/events/bookmarks", body: { event_id: eventId } },
    { method: "POST", path: "/api/v1/events/bookmarks", body: { eventId } },
    { method: "POST", path: `/api/v1/events/${eventId}/bookmark` },
    { method: "PUT", path: `/api/v1/events/${eventId}/bookmark` },
    { method: "POST", path: `/api/v1/event-bookmarks/${eventId}/toggle` },
    { method: "POST", path: `/api/v1/events/bookmarks/${eventId}/toggle` },
  ];

  for (const attempt of attempts) {
    const response = await fetch(`${getBackendBaseUrl()}${attempt.path}`, {
      method: attempt.method,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      ...(attempt.body ? { body: JSON.stringify(attempt.body) } : {}),
      cache: "no-store",
    });
    if (response.ok) {
      return response;
    }
    if (response.status === 404 || response.status === 405) {
      continue;
    }
    return response;
  }

  return null;
}

export async function GET(request: NextRequest) {
  if (getAppDataMode() === "mock") {
    const authToken = readBackendToken(request) || "mock-user";
    const ids = Array.from(getStore().map.get(authToken) ?? []);
    return NextResponse.json({
      success: true,
      data: {
        eventIds: ids,
      },
    });
  }

  const authToken = readBackendToken(request);
  if (!authToken) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const backendResponse = await tryGetBookmarks(authToken);
  if (!backendResponse) {
    return NextResponse.json({ success: false, error: "Bookmark endpoint not found in backend" }, { status: 404 });
  }

  if (!backendResponse.ok) {
    const errorPayload = await backendResponse.json().catch(() => null);
    return NextResponse.json(
      {
        success: false,
        error:
          (typeof errorPayload === "object" &&
            errorPayload !== null &&
            "error" in errorPayload &&
            typeof errorPayload.error === "string" &&
            errorPayload.error) ||
          "Unable to fetch bookmarks",
      },
      { status: backendResponse.status },
    );
  }

  const backendPayload = await backendResponse.json().catch(() => null);
  const eventIds = extractItems(backendPayload)
    .map((item) => extractEventId(item))
    .filter(Boolean);

  return NextResponse.json({
    success: true,
    data: {
      eventIds: [...new Set(eventIds)],
    },
  });
}

export async function POST(request: NextRequest) {
  if (getAppDataMode() === "mock") {
    const authToken = readBackendToken(request) || "mock-user";
    const body = await request.json().catch(() => null);
    const eventId = body && typeof body === "object" && typeof (body as AnyRecord).eventId === "string"
      ? ((body as AnyRecord).eventId as string)
      : "";
    if (!eventId) {
      return NextResponse.json({ success: false, error: "eventId is required" }, { status: 400 });
    }

    const store = getStore();
    const current = store.map.get(authToken) ?? new Set<string>();
    const bookmarked = !current.has(eventId);
    if (bookmarked) {
      current.add(eventId);
    } else {
      current.delete(eventId);
    }
    store.map.set(authToken, current);

    return NextResponse.json({
      success: true,
      data: {
        bookmarked,
      },
    });
  }

  const authToken = readBackendToken(request);
  if (!authToken) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const eventId = body && typeof body === "object" && typeof (body as AnyRecord).eventId === "string"
    ? ((body as AnyRecord).eventId as string)
    : "";

  if (!eventId) {
    return NextResponse.json({ success: false, error: "eventId is required" }, { status: 400 });
  }

  const backendResponse = await tryToggleBookmark(authToken, eventId);
  if (!backendResponse) {
    return NextResponse.json({ success: false, error: "Bookmark endpoint not found in backend" }, { status: 404 });
  }

  if (!backendResponse.ok) {
    const errorPayload = await backendResponse.json().catch(() => null);
    return NextResponse.json(
      {
        success: false,
        error:
          (typeof errorPayload === "object" &&
            errorPayload !== null &&
            "error" in errorPayload &&
            typeof errorPayload.error === "string" &&
            errorPayload.error) ||
          "Unable to toggle bookmark",
      },
      { status: backendResponse.status },
    );
  }

  const backendPayload = await backendResponse.json().catch(() => null);
  let bookmarked = extractBookmarked(backendPayload);
  if (bookmarked === null) {
    const refreshed = await tryGetBookmarks(authToken);
    if (refreshed?.ok) {
      const refreshedPayload = await refreshed.json().catch(() => null);
      const ids = extractItems(refreshedPayload)
        .map((item) => extractEventId(item))
        .filter(Boolean);
      bookmarked = ids.includes(eventId);
    }
  }
  return NextResponse.json({
    success: true,
    data: {
      bookmarked,
    },
  });
}
