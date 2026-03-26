"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { X, User, Users, Globe, Bell, Lock, Shield, ChevronDown, AlertCircle, Search, ChevronRight, ArrowLeft } from "lucide-react";

import { LegalDocumentDialog } from "@/components/settings/privacy/dialogs/LegalDocumentDialog";
import Link from "next/link";

// ─── Country list ──────────────────────────────────────────────────────────────
const COUNTRIES_LIST = [
  { code: "+1", name: "United States" },
  { code: "+44", name: "United Kingdom" },
  { code: "+66", name: "Thailand" },
  { code: "+81", name: "Japan" },
  { code: "+82", name: "South Korea" },
  { code: "+86", name: "China" },
  { code: "+91", name: "India" },
  { code: "+61", name: "Australia" },
  { code: "+49", name: "Germany" },
  { code: "+33", name: "France" },
];

// ─── Custom phone input ────────────────────────────────────────────────────────
function PhoneField({
  value, onChange, countryCode, onCountryChange,
}: {
  value: string;
  onChange: (v: string) => void;
  countryCode: string;
  onCountryChange: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = COUNTRIES_LIST.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search),
  );

  return (
    <div className="flex gap-2">
      <div className="relative" ref={ref}>
        <div
          onClick={() => setOpen((o) => !o)}
          className="h-[38px] w-[90px] flex items-center justify-between rounded-lg border border-gray-200 bg-white px-2.5 cursor-pointer hover:bg-gray-50 transition"
        >
          <span className="text-sm text-gray-800">{countryCode}</span>
          <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
        </div>
        {open && (
          <div className="absolute top-full left-0 z-50 mt-1 w-[240px] rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center border-b border-gray-100 px-3 py-2">
              <Search size={14} className="text-gray-400 mr-2 flex-shrink-0" />
              <input autoFocus type="text" placeholder="Search country" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400" />
            </div>
            <div className="max-h-[180px] overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="py-3 text-center text-xs text-gray-400">No results</p>
              ) : (
                filtered.map((c) => (
                  <div key={c.name}
                    onClick={() => { onCountryChange(c.code); setOpen(false); setSearch(""); }}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition">
                    <span className="text-gray-800">{c.name}</span>
                    <span className="text-gray-400">{c.code}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <input type="tel" placeholder="84 268 8558" value={value} onChange={(e) => onChange(e.target.value)}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] transition" />
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

type Tab = "profile" | "managers" | "language" | "notification" | "security" | "privacy";
type LegalModalType = "policy" | "terms";
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-[#3C7ACB]" : "bg-gray-200"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function FieldInput({ label, placeholder, value, onChange, type = "text", disabled = false }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {disabled
        ? <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} disabled
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] transition cursor-not-allowed" />
        : <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] transition" />
      }
    </div>
  );
}

function RowItem({ title, subtitle, right }: { title: string; subtitle: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex-shrink-0">{right}</div>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileModal({
  onClose,
  sessionUser = null,
  onboardingProfile = null,
  avatarDataUrl = null,
  onAvatarChange = () => { },
}: {
  onClose: () => void;
  sessionUser?: SessionUser | null;
  onboardingProfile?: OnboardingProfile | null;
  avatarDataUrl?: string | null;
  onAvatarChange?: (avatarDataUrl: string | null) => void;
}) {
  const [tab, setTab] = useState<Tab>("profile");
  // null = showing the tab menu (mobile only); set to a Tab value = viewing that tab
  const [mobileTab, setMobileTab] = useState<Tab | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutToast, setLogoutToast] = useState<"success" | "none" | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Initial values ────────────────────────────────────────────────────────
  const initProfile = {
    orgName: onboardingProfile?.orgName ?? "",
    abbrev: onboardingProfile?.abbreviation ?? "",
    orgType: onboardingProfile?.orgType ?? "",
    orgTypeOther: "",
    city: onboardingProfile?.city ?? "",
    country: onboardingProfile?.country ?? "",
    link1: onboardingProfile?.website ?? "",
    link2: onboardingProfile?.socialMedia ?? "",
    link3: onboardingProfile?.otherUrls ?? "",
    email: onboardingProfile?.officialEmail || sessionUser?.email || "",
    phone: onboardingProfile?.officialPhoneNumber ?? "",
    phoneCode: "+66",
  };

  const initManagers = {
    repName: onboardingProfile?.representativeName || sessionUser?.name || "Member",
    repRole: onboardingProfile?.representativeRole ?? "",
    repEmail: sessionUser?.email ?? "",
    repPhone: onboardingProfile?.representativePhoneNumber ?? "",
    repPhoneCode: "+66",
  };

  // ── Profile state ─────────────────────────────────────────────────────────
  const [orgName, setOrgName] = useState(initProfile.orgName);
  const [abbrev, setAbbrev] = useState(initProfile.abbrev);
  const [orgType, setOrgType] = useState(initProfile.orgType);
  const [orgTypeOther, setOrgTypeOther] = useState(initProfile.orgTypeOther);
  const [city, setCity] = useState(initProfile.city);
  const [country, setCountry] = useState(initProfile.country);
  const [link1, setLink1] = useState(initProfile.link1);
  const [link2, setLink2] = useState(initProfile.link2);
  const [link3, setLink3] = useState(initProfile.link3);
  const [email, setEmail] = useState(initProfile.email);
  const [phone, setPhone] = useState(initProfile.phone);
  const [phoneCode, setPhoneCode] = useState(initProfile.phoneCode);

  // ── Managers state ────────────────────────────────────────────────────────
  const [repName, setRepName] = useState(initManagers.repName);
  const [repRole, setRepRole] = useState(initManagers.repRole);
  const [repEmail, setRepEmail] = useState(initManagers.repEmail);
  const [repPhone, setRepPhone] = useState(initManagers.repPhone);
  const [repPhoneCode, setRepPhoneCode] = useState(initManagers.repPhoneCode);

  // ── Sync state when props change ──────────────────────────────────────────
  useEffect(() => {
    setOrgName(initProfile.orgName);
    setAbbrev(initProfile.abbrev);
    setOrgType(initProfile.orgType);
    setCity(initProfile.city);
    setCountry(initProfile.country);
    setLink1(initProfile.link1);
    setLink2(initProfile.link2);
    setLink3(initProfile.link3);
    setEmail(initProfile.email);
    setPhone(initProfile.phone);
    setRepName(initManagers.repName);
    setRepRole(initManagers.repRole);
    setRepPhone(initManagers.repPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingProfile, sessionUser]);

  // ── Completeness & dirty ──────────────────────────────────────────────────
  const profileComplete =
    orgName.trim() !== "" && abbrev.trim() !== "" && city.trim() !== "" &&
    country.trim() !== "" && email.trim() !== "" && phone.trim() !== "" &&
    (orgType !== "Other" || orgTypeOther.trim() !== "");

  const managersComplete =
    repName.trim() !== "" && repRole.trim() !== "" &&
    repEmail.trim() !== "" && repPhone.trim() !== "";

  const profileDirty =
    orgName !== initProfile.orgName || abbrev !== initProfile.abbrev ||
    orgType !== initProfile.orgType || orgTypeOther !== initProfile.orgTypeOther ||
    city !== initProfile.city || country !== initProfile.country ||
    link1 !== initProfile.link1 || link2 !== initProfile.link2 || link3 !== initProfile.link3 ||
    email !== initProfile.email || phone !== initProfile.phone || phoneCode !== initProfile.phoneCode;

  const managersDirty =
    repName !== initManagers.repName || repRole !== initManagers.repRole ||
    repEmail !== initManagers.repEmail || repPhone !== initManagers.repPhone ||
    repPhoneCode !== initManagers.repPhoneCode;

  // active tab is the desktop tab OR the mobile tab (whichever is in use)
  const activeTab = mobileTab ?? tab;
  const isDirty = activeTab === "profile" ? profileDirty : managersDirty;
  const canSave = activeTab === "profile" ? (isDirty && profileComplete) : (isDirty && managersComplete);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifSecurity, setNotifSecurity] = useState(true);
  const [notifOffers, setNotifOffers] = useState(true);

  // ── Legal modal ───────────────────────────────────────────────────────────
  const [legalModalType, setLegalModalType] = useState<LegalModalType | null>(null);
  const [legalModalContent, setLegalModalContent] = useState("");
  const [legalModalLoading, setLegalModalLoading] = useState(false);
  const [legalModalError, setLegalModalError] = useState<string | null>(null);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User size={16} /> },
    { key: "managers", label: "Managers", icon: <Users size={16} /> },
    { key: "language", label: "Language", icon: <Globe size={16} /> },
    { key: "notification", label: "Notification", icon: <Bell size={16} /> },
    { key: "security", label: "Security", icon: <Lock size={16} /> },
    { key: "privacy", label: "Privacy", icon: <Shield size={16} /> },
  ];

  function openLegalModal(type: LegalModalType) {
    const isThai = typeof window !== "undefined" && window.navigator.language.toLowerCase().startsWith("th");
    const pathByType: Record<LegalModalType, string> = {
      policy: isThai ? "/org/assets/legal/policy-th.txt" : "/org/assets/legal/policy-en.txt",
      terms: isThai ? "/org/assets/legal/terms-th.txt" : "/org/assets/legal/terms-en.txt",
    };
    setLegalModalType(type);
    setLegalModalLoading(true);
    setLegalModalError(null);
    setLegalModalContent("");
    fetch(pathByType[type], { cache: "no-store" })
      .then(async (r) => { if (!r.ok) throw new Error(); return r.text(); })
      .then(setLegalModalContent)
      .catch(() => setLegalModalError("Unable to load document content."))
      .finally(() => setLegalModalLoading(false));
  }

  function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      onAvatarChange(result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  // ── Tab content ───────────────────────────────────────────────────────────
  // Shared between desktop and mobile — just pass which tab to render
  function TabContent({ t }: { t: Tab }) {
    return (
      <>
        {t === "profile" && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Profile Picture</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
                    {avatarDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarDataUrl} alt="User avatar" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(sessionUser?.name ?? "Member")
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{sessionUser?.name ?? "Member"}</p>
                    <p className="text-xs text-gray-500">{sessionUser?.email ?? "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
                  <button type="button" onClick={() => avatarInputRef.current?.click()}
                    className="px-4 py-2 text-sm border border-[#3C7ACB] text-[#3C7ACB] rounded-lg hover:bg-blue-50 transition">
                    Change Image
                  </button>
                  {avatarDataUrl && (
                    <button type="button" onClick={() => onAvatarChange(null)}
                      className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Organization</p>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="Organization Name" placeholder="e.g. Unitif Education" value={orgName} onChange={setOrgName} />
                <FieldInput label="Abbreviation Name" placeholder="e.g. UE" value={abbrev} onChange={setAbbrev} />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Organization Type</label>
                  <div className="relative">
                    <select value={orgType} onChange={(e) => setOrgType(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] appearance-none">
                      <option>University</option><option>School</option><option>NGO</option>
                      <option>Company</option><option>Other</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FieldInput label="City" placeholder="Bangkok" value={city} onChange={setCity} />
                  <FieldInput label="Country" placeholder="Thailand" value={country} onChange={setCountry} />
                </div>
                {orgType === "Other" && (
                  <div className="col-span-2">
                    <FieldInput label="Please specify" placeholder="Describe your organization type" value={orgTypeOther} onChange={setOrgTypeOther} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Links</p>
              <div className="flex flex-col gap-2">
                <FieldInput label="Link 1" placeholder="https://..." value={link1} onChange={setLink1} />
                <FieldInput label="Link 2" placeholder="https://..." value={link2} onChange={setLink2} />
                <FieldInput label="Link 3" placeholder="https://..." value={link3} onChange={setLink3} />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Contact</p>
              <div className="flex flex-cols-1 md:flex-cols-2 gap-3">
                <FieldInput label="Official Email" placeholder="contact@org.com" type="email" value={email} onChange={setEmail} disabled={true} />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                  <PhoneField value={phone} onChange={setPhone} countryCode={phoneCode} onCountryChange={setPhoneCode} />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Account Deletion</p>
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your organization account and all associated data will be permanently deleted after confirmation and internal review, and this action cannot be undone.
                </p>
                <button className="flex-shrink-0 px-4 py-2 text-sm border border-red-400 text-red-500 rounded-lg hover:bg-red-50 transition">Delete Account</button>
              </div>
            </div>
          </div>
        )}

        {t === "managers" && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-4">Managers</p>
            <div className="flex flex-col gap-3">
              <FieldInput label="Representative Name" placeholder="Full name" value={repName} onChange={setRepName} />
              <FieldInput label="Representative Role" placeholder="e.g. Director, Manager" value={repRole} onChange={setRepRole} />
              <FieldInput label="Representative Email" placeholder="rep@org.com" type="email" value={repEmail} onChange={setRepEmail} />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                <PhoneField value={repPhone} onChange={setRepPhone} countryCode={repPhoneCode} onCountryChange={setRepPhoneCode} />
              </div>
            </div>
          </div>
        )}

        {t === "language" && (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Language settings coming soon</div>
        )}

        {t === "notification" && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Notification</p>
            <RowItem title="Account Security Alerts" subtitle="Important notifications related to your account and security."
              right={<Toggle checked={notifSecurity} onChange={() => setNotifSecurity((v) => !v)} />} />
            <RowItem title="Offers & Announcements" subtitle="Platform news, updates, and occasional offers."
              right={<Toggle checked={notifOffers} onChange={() => setNotifOffers((v) => !v)} />} />
          </div>
        )}

        {t === "security" && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Security</p>
            <RowItem title="Change Password" subtitle="Update your account password."
              right={<button className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Change Password</button>} />
            <RowItem title="Device Login" subtitle="Sign out from all devices at once."
              right={<button onClick={() => setShowLogoutConfirm(true)} className="px-4 py-1.5 text-sm border border-red-400 text-red-500 rounded-lg hover:bg-red-50 transition">Logout All Devices</button>} />
          </div>
        )}

        {t === "privacy" && (
          <div>
            <RowItem title="Terms of Service" subtitle="Review the terms and conditions for using the platform and its services."
              right={<button onClick={() => openLegalModal("terms")} className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">View Terms</button>} />
            <RowItem title="Privacy Policy" subtitle="Learn how your personal data is collected, used, and protected in accordance with applicable laws."
              right={<button onClick={() => openLegalModal("policy")} className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">View Policy</button>} />
          </div>
        )}
      </>
    );
  }

  const showFooter = (activeTab === "profile" || activeTab === "managers");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* ── MOBILE HEADER ── */}
        <div className="md:hidden flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          {mobileTab ? (
            <button onClick={() => setMobileTab(null)} className="text-gray-500 hover:text-gray-700 transition p-1 -ml-1">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-7" /> /* spacer to center title */
          )}
          <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: "Chillax, sans-serif" }}>
            {mobileTab ? tabs.find((t) => t.key === mobileTab)?.label : "Settings"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1">
            <X size={18} />
          </button>
        </div>

        {/* ── DESKTOP HEADER ── */}
        <div className="hidden md:flex items-center justify-between px-6 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: "Chillax, sans-serif" }}>Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
        </div>

        {/* ── MOBILE: tab list or tab content ── */}
        <div className="md:hidden flex flex-col flex-1 overflow-hidden">
          {mobileTab === null ? (
            /* Tab selection list */
            <div className="overflow-y-auto flex-1 py-2">
              {tabs.map(({ key, label, icon }) => (
                <button key={key} onClick={() => setMobileTab(key)}
                  className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 active:bg-gray-100 transition text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-[#3C7ACB]">{icon}</span>
                    <span className="text-sm font-medium text-gray-800">{label}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          ) : (
            /* Tab content */
            <>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <TabContent t={mobileTab} />
              </div>

              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
                <Link href={`/login`} className="px-5 py-2 rounded-xl text-sm text-white font-medium bg-red-500 hover:bg-red-300 mr-auto">Logout</Link>
                {showFooter && (<div className="flex items-center justify-end gap-3  flex-shrink-0">
                  <button onClick={() => setMobileTab(null)}
                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button disabled={!canSave}
                    className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition ${canSave ? "bg-gray-900 hover:bg-gray-700 cursor-pointer" : "bg-gray-300 cursor-not-allowed"}`}>
                    Save
                  </button>
                </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── DESKTOP: sidebar + content ── */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* Left nav */}
          <div className="w-44 flex-shrink-0 border-r border-gray-100 py-4 px-3">
            {tabs.map(({ key, label, icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition mb-0.5 ${tab === key ? "bg-[#EEF5FC] text-[#3C7ACB]" : "text-gray-600 hover:bg-gray-50"}`}>
                {icon}{label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <TabContent t={tab} />
          </div>
        </div>

        {/* Desktop footer */}

        <div className="hidden md:flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <Link href={`/login`} className="px-5 py-2 rounded-xl text-sm text-white font-medium bg-red-500 hover:bg-red-300 mr-auto">Logout</Link>
          {showFooter &&
            (<div className="hidden md:flex items-center justify-end gap-3 flex-shrink-0"><button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button disabled={!canSave}
                className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition ${canSave ? "bg-gray-900 hover:bg-gray-700 cursor-pointer" : "bg-gray-300 cursor-not-allowed"}`}>
                Save
              </button></div>)
          }
        </div>
      </div>

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-5">
              <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                <div className="absolute w-16 h-16 rounded-full bg-[#FFF1F2]" />
                <div className="absolute w-11 h-11 rounded-full bg-[#FFE4E4]" />
                <div className="relative w-7 h-7 rounded-full flex items-center justify-center">
                  <AlertCircle size={28} className="text-[#F43F5E]" />
                </div>
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-1.5">Log out of all other devices</h2>
              <p className="text-sm text-gray-500 leading-relaxed">All other devices will be signed out. You will remain signed in on this device.</p>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-end gap-3 px-6 py-4">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={() => { setShowLogoutConfirm(false); setLogoutToast("success"); setTimeout(() => setLogoutToast(null), 4000); }}
                className="px-5 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Logout toast */}
      {logoutToast && (
        <div className="fixed top-5 right-5 z-[400] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-start gap-3 max-w-sm animate-in slide-in-from-top-2">
          <div className="relative flex-shrink-0 mt-0.5 w-12 h-12 flex items-center justify-center">
            <div className="absolute w-11 h-11 rounded-full border-2 border-[#3C7ACB]/20" />
            <div className="absolute w-8 h-8 rounded-full border-2 border-[#3C7ACB]/40" />
            <div className="relative w-5 h-5 rounded-full flex items-center justify-center bg-white">
              <AlertCircle size={20} className="text-[#3C7ACB]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-snug">
              {logoutToast === "success" ? "Successfully signed out from all other devices." : "No other active sessions found."}
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {logoutToast === "success" ? "All other devices will be signed out. You'll stay signed in on this device." : "You're currently signed in on this device only."}
            </p>
          </div>
          <button onClick={() => setLogoutToast(null)} className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"><X size={16} /></button>
        </div>
      )}

      {/* Legal document dialog */}
      {legalModalType && (
        <LegalDocumentDialog
          title={legalModalType === "terms" ? "Terms of Service" : "Privacy Policy"}
          content={legalModalContent}
          loading={legalModalLoading}
          error={legalModalError}
          onClose={() => setLegalModalType(null)}
        />
      )}
    </div>
  );
}
