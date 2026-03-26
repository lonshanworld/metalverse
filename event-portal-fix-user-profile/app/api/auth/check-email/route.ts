import { NextRequest, NextResponse } from "next/server";
import { getAppDataMode, getBackendBaseUrl } from "@/shared/config/data-mode";

const MOCK_LOGIN_EMAIL = "admin@medalverse.io";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!email) {
    return NextResponse.json({ success: false, error: "email is required" }, { status: 400 });
  }

  const mode = getAppDataMode();
  if (mode === "mock") {
    return NextResponse.json({
      success: true,
      data: { exists: email === MOCK_LOGIN_EMAIL },
    });
  }

  try {
    const backendResponse = await fetch(
      `${getBackendBaseUrl()}/api/v1/users/email?email=${encodeURIComponent(email)}`,
      { cache: "no-store" },
    );

    if (backendResponse.ok) {
      return NextResponse.json({ success: true, data: { exists: true } });
    }

    if (backendResponse.status === 404 || backendResponse.status === 400) {
      return NextResponse.json({ success: true, data: { exists: false } });
    }

    const payload = await backendResponse.json().catch(() => null);
    return NextResponse.json(
      {
        success: false,
        error:
          payload && typeof payload.error === "string"
            ? payload.error
            : "Unable to check email.",
      },
      { status: backendResponse.status || 500 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to check email." },
      { status: 500 },
    );
  }
}
