"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, CalendarDays } from "lucide-react";
import Sidebar from "./Sidebar";
import ProfileModal from "./ProfileModal";
import Link from "next/link";
import { getBackendBaseUrl } from "@/shared/config/data-mode";
import { readBackendAccessToken } from "@/shared/auth/backend-access-token.client";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
};

type OnboardingProfile = {
  orgName: string;
  abbreviation: string;
  orgType: string;
  customOrgType: string;
  city: string;
  country: string;
  website: string;
  socialMedia: string;
  otherUrls: string;
  officialEmail: string;
  officialPhoneNumber: string;
  representativeName: string;
  representativeRole: string;
  representativePhoneNumber: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Desktop sidebar: starts expanded
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Mobile dropdown: always starts closed, never tied to sidebarOpen
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [onboardingProfile, setOnboardingProfile] = useState<OnboardingProfile | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const h = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [mobileMenuOpen]);

  useEffect(() => {
    fetch("/org/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json().catch(() => null);
        if (!payload?.success || !payload?.data?.user) return null;
        return payload.data.user as SessionUser;
      })
      .then((user) => {
        if (user) setSessionUser(user);
      })
      .catch(() => {
        // ignore session fetch errors in layout
      });
  }, []);

  useEffect(() => {
    if (!sessionUser?.email) return;
    const url = `${getBackendBaseUrl()}/api/v1/organizations/onboarding-submissions/latest?email=${encodeURIComponent(sessionUser.email)}`;
    const backendToken = readBackendAccessToken();
    fetch(url, {
      cache: "no-store",
      headers: backendToken ? { Authorization: `Bearer ${backendToken}` } : {},
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json().catch(() => null);
        if (!payload?.success || !payload?.data) return null;
        const data = payload.data as Record<string, unknown>;
        return {
          orgName: typeof data.org_name === "string" ? data.org_name : "",
          abbreviation: typeof data.abbreviation === "string" ? data.abbreviation : "",
          orgType: typeof data.org_type === "string" ? data.org_type : "",
          customOrgType: typeof data.custom_org_type === "string" ? data.custom_org_type : "",
          city: typeof data.city === "string" ? data.city : "",
          country: typeof data.country === "string" ? data.country : "",
          website: typeof data.website === "string" ? data.website : "",
          socialMedia: typeof data.social_media === "string" ? data.social_media : "",
          otherUrls: typeof data.other_urls === "string" ? data.other_urls : "",
          officialEmail: typeof data.official_email === "string" ? data.official_email : "",
          officialPhoneNumber: typeof data.official_phone_number === "string" ? data.official_phone_number : "",
          representativeName: typeof data.representative_name === "string" ? data.representative_name : "",
          representativeRole: typeof data.representative_role === "string" ? data.representative_role : "",
          representativePhoneNumber: typeof data.representative_phone_number === "string" ? data.representative_phone_number : "",
        } as OnboardingProfile;
      })
      .then((profile) => {
        if (profile) setOnboardingProfile(profile);
      })
      .catch(() => {
        // no saved onboarding profile
      });
  }, [sessionUser?.email]);

  useEffect(() => {
    if (!sessionUser?.id || typeof window === "undefined") return;
    const key = `mv_event_portal_avatar_${sessionUser.id}`;
    const saved = window.localStorage.getItem(key);
    setAvatarDataUrl(saved && saved.trim() ? saved : null);
  }, [sessionUser?.id]);

  const handleAvatarChange = (nextAvatarDataUrl: string | null) => {
    setAvatarDataUrl(nextAvatarDataUrl);
    if (!sessionUser?.id || typeof window === "undefined") return;
    const key = `mv_event_portal_avatar_${sessionUser.id}`;
    if (!nextAvatarDataUrl) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, nextAvatarDataUrl);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-60 z-0"
        style={{
          backgroundImage: "url('/org/images/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "bottom right",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Desktop sidebar — minimizes to icon strip, never fully hidden */}
      <div
        className={`hidden md:block flex-shrink-0 transition-all duration-300 ${sidebarOpen ? "w-[254px]" : "w-[96px]"
          }`}
      >
        <Sidebar minimized={!sidebarOpen} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        {/* Topbar */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm">

            {/* Desktop hamburger — only toggles sidebar minimize, invisible on mobile */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="hidden md:flex items-center justify-center text-gray-500 hover:text-gray-700 transition p-1 rounded-md hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>

            {/* Mobile hamburger — only toggles dropdown nav, invisible on desktop */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex md:hidden items-center justify-center text-gray-500 hover:text-gray-700 transition p-1 rounded-md hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{sessionUser?.name ?? "Member"}</p>
                <p className="text-xs text-gray-400">{sessionUser?.email ?? "-"}</p>
              </div>
              <button onClick={() => setProfileOpen(true)}
                className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 hover:ring-2 hover:ring-[#3C7ACB] transition">
                {avatarDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarDataUrl} alt="User avatar" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  getInitials(sessionUser?.name ?? "Member")
                )}
              
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown nav — only visible below md, only when explicitly opened */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden mx-3 mt-1 bg-white rounded-2xl border border-gray-100 shadow-lg z-50 overflow-hidden"
          >
            <div className="flex flex-col py-2 px-3">
              <Link
                href="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <CalendarDays size={18} /> Events
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 w-full text-left"
              >
                <X size={18} /> Close
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

      {profileOpen && (
        <ProfileModal
          onClose={() => setProfileOpen(false)}
          sessionUser={sessionUser}
          onboardingProfile={onboardingProfile}
          avatarDataUrl={avatarDataUrl}
          onAvatarChange={handleAvatarChange}
        />
      )}
    </div>
  );
}
