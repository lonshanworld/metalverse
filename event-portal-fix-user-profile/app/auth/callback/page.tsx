"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { writeBackendAccessToken } from "@/shared/auth/backend-access-token.client";
import { getBackendBaseUrl } from "@/shared/config/data-mode";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function completeLogin() {
      if (!token) {
        setError("Missing Google login token.");
        return;
      }

      try {
        const response = await fetch("/org/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success) {
          setError(payload?.error ?? "Unable to complete Google login.");
          return;
        }

        writeBackendAccessToken(token);

        // Match the same flow as manual login:
        // - If onboarding exists for this email => go to /events
        // - Otherwise => go to /welcome/info
        const sessionResponse = await fetch("/org/api/auth/session", { cache: "no-store" });
        const sessionPayload = await sessionResponse.json().catch(() => null);
        const email = sessionPayload?.data?.user?.email;

        if (typeof email === "string" && email.trim()) {
          const onboardingUrl = `${getBackendBaseUrl()}/api/v1/organizations/onboarding-submissions/latest?email=${encodeURIComponent(email)}`;

          // Check if this user already completed onboarding.
          // On any error (network, auth, server) → default to skipping onboarding
          // so returning users are never forced to re-fill the form.
          let hasOnboarding = false;
          try {
            const onboardingResponse = await fetch(onboardingUrl, {
              cache: "no-store",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (onboardingResponse.ok) {
              const body = await onboardingResponse.json().catch(() => null);
              hasOnboarding = body?.success === true && body?.data != null;
            }
            // 404 = no onboarding found → hasOnboarding stays false
            // 401/403/5xx → treat as unknown → default to skip (hasOnboarding stays false... but safer to go to events)
            if (!onboardingResponse.ok && onboardingResponse.status !== 404) {
              hasOnboarding = true; // non-404 error → don't force onboarding
            }
          } catch {
            hasOnboarding = true; // network error → don't force onboarding
          }

          if (hasOnboarding) {
            router.replace("/events");
          } else {
            router.replace(`/welcome/info?email=${encodeURIComponent(email)}`);
          }
          router.refresh();
          return;
        }

        router.replace("/events");
        router.refresh();
      } catch {
        setError("Network error while finalizing Google login.");
      }
    }

    completeLogin();
  }, [router, token]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-6 text-slate-700">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Signing you in...</h1>
        {error ? (
          <p className="mt-3 text-sm text-rose-600">{error}</p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Completing your Google login.</p>
        )}
      </div>
    </main>
  );
}
