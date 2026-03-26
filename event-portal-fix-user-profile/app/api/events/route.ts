import { NextRequest, NextResponse } from "next/server";
import { SESSION_CONFIG, verifySessionToken } from "@/shared/auth/session-token";
import { getBackendBaseUrl } from "@/shared/config/data-mode";

type BackendEvent = {
  event_id: string;
  name: string;
  description?: string;
  short_description?: string;
  status?: string;
  start_at?: string;
  end_at?: string;
  capacity?: number;
  remaining_seats?: number;
  created_by?: string;
  location?: { name?: string; address?: string };
};

function normalizeStatus(status?: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "PUBLISHED") return "active";
  if (s === "COMPLETED") return "completed";
  if (s === "REVISION") return "revision";
  return "pending";
}

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_CONFIG.cookieName)?.value ?? "";
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  if (!session?.sub) {
    return NextResponse.json({ success: true, data: [] });
  }

  const url = `${getBackendBaseUrl()}/api/v1/events?page=1&page_size=100&created_by=${encodeURIComponent(session.sub)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return NextResponse.json({ success: false, error: text || "Failed to fetch events" }, { status: response.status });
  }

  const payload = await response.json().catch(() => ({}));
  const rawEvents = Array.isArray(payload?.data) ? (payload.data as BackendEvent[]) : [];

  const events = rawEvents.map((event) => {
    const startAt = event.start_at ? new Date(event.start_at) : null;
    const endAt = event.end_at ? new Date(event.end_at) : null;
    const dateLabel =
      startAt && !Number.isNaN(startAt.getTime())
        ? `${startAt.toLocaleDateString()}${endAt ? ` - ${endAt.toLocaleDateString()}` : ""}`
        : "Date TBA";

    const capacity = typeof event.capacity === "number" ? event.capacity : 0;
    const remaining = typeof event.remaining_seats === "number" ? event.remaining_seats : 0;

    return {
      id: event.event_id,
      name: event.name ?? "Untitled Event",
      type: "Event",
      status: normalizeStatus(event.status),
      description: event.short_description || event.description || "No description",
      eventDates: [dateLabel],
      locationName: event.location?.name || "Location TBA",
      locationAddress: event.location?.address || "",
      totalSeats: capacity,
      filledSeats: Math.max(capacity - remaining, 0),
      image: `https://picsum.photos/seed/${encodeURIComponent(event.event_id)}/800/420`,
      registrationPeriod: "N/A",
      applicants: [],
    };
  });

  return NextResponse.json({ success: true, data: events });
}

