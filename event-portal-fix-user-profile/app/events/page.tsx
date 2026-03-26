"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Toast from "@/components/Toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronDown, CalendarDays, MapPin, Users, MoreVertical, AlertCircle } from "lucide-react";
import { MockEvent, EventStatus, STATUS_STYLES } from "@/lib/mockEvents";
import { getBackendBaseUrl } from "@/shared/config/data-mode";

type ToastMsg = { title: string; subtitle: string } | null;

function StatusBadge({ status }: { status: EventStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({
  title, message, confirmLabel, confirmClass, onConfirm, onCancel,
}: {
  title: string; message: string; confirmLabel: string; confirmClass: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 pt-6 pb-5">
          <div className="relative w-16 h-16 flex items-center justify-center mb-4">
            <div className="absolute w-16 h-16 rounded-full bg-[#FFF1F2]" />
            <div className="absolute w-11 h-11 rounded-full bg-[#FFE4E4]" />
            <div className="relative w-7 h-7 rounded-full flex items-center justify-center">
              <AlertCircle size={28} className="text-[#F43F5E]" />
            </div>
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-1.5">{title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="border-t border-gray-100" />
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button onClick={onCancel}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Event Card ────────────────────────────────────────────────────────────────

function EventCard({
  event, onDelete, onShare, onCloseApp,
}: {
  event: MockEvent;
  onDelete: (id: string) => void;
  onShare: (event: MockEvent) => void;
  onCloseApp: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const menuItems: { label: string; action: () => void; danger?: boolean }[] = [];
  if (event.status === "pending" || event.status === "revision") {
    menuItems.push({ label: "Edit", action: () => router.push(`/events/new?editId=${event.id}`) });
  }
  if (event.status === "pending") {
    menuItems.push({ label: "Delete", action: () => onDelete(event.id), danger: true });
  }
  if (event.status === "active" || event.status === "completed") {
    menuItems.push({ label: "Share", action: () => onShare(event) });
  }
  if (event.status === "active") {
    menuItems.push({ label: "Close Application", action: () => onCloseApp(event.id), danger: true });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow relative">

      {/* ── Mobile: banner on top, info below ── */}
      <div className="flex flex-col sm:hidden">
        <div className="flex flex-col">
          <div className="w-full h-40 bg-gray-100 overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
          </div>
          <div className="px-4 pt-3 pb-4 pr-12">
            <h3 className="text-base font-semibold text-gray-900">{event.name}</h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StatusBadge status={event.status} />
              <span className="text-sm text-gray-500">{event.type}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{event.description}</p>
            <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-2">
              <div className="flex items-start gap-1.5">
                <CalendarDays size={14} className="text-[#3C7ACB] mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-xs font-medium text-gray-700 leading-snug break-words">
                    {event.eventDates[0].split(",")[1]?.trim().split(" at")[0] ?? event.eventDates[0]}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <MapPin size={14} className="text-[#3C7ACB] mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-xs font-medium text-gray-700 leading-snug break-words">
                    {event.locationName.split(",")[0]}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <Users size={14} className="text-[#3C7ACB] mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Seats</p>
                  <p className="text-xs font-medium text-gray-700">{event.filledSeats}/{event.totalSeats}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop: banner left, info right ── */}
      <div className="hidden sm:flex overflow-hidden">
        <div className="flex flex-1 overflow-hidden min-w-0">
          <div className="flex-shrink-0 w-48 bg-gray-100 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 px-5 py-4 min-w-0 pr-12">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">{event.name}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusBadge status={event.status} />
                <span className="text-sm text-gray-500">{event.type}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2.5 line-clamp-2 leading-relaxed">{event.description}</p>
            <div className="flex items-center gap-16 mt-3.5">
              <div className="flex items-center gap-1.5">
                <CalendarDays size={14} className="text-[#3C7ACB]" />
                <div>
                  <p className="text-xs text-gray-400">Event Date</p>
                  <p className="text-xs font-medium text-gray-700">{event.eventDates[0].split(",")[1]?.trim().split(" at")[0] ?? event.eventDates[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[#3C7ACB]" />
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-xs font-medium text-gray-700">{event.locationName.split(",")[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-[#3C7ACB]" />
                <div>
                  <p className="text-xs text-gray-400">Seats</p>
                  <p className="text-xs font-medium text-gray-700">{event.filledSeats}/{event.totalSeats}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three-dot menu — shared, sits over both layouts */}
      {menuItems.length > 0 && (
        <div ref={menuRef} className="absolute top-3 right-3 z-10">
          <button onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 transition bg-white/70 backdrop-blur-sm hover:bg-white">
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]">
              {menuItems.map((item) => (
                <button key={item.label} onClick={() => { item.action(); setMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50 ${item.danger ? "text-red-500" : "text-gray-700"}`}>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [toast, setToast] = useState<ToastMsg>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [closeAppId, setCloseAppId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    fetch("/org/api/events", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || "Failed to load events.");
        }
        setEvents(Array.isArray(payload.data) ? payload.data : []);
      })
      .catch(() => {
        setEvents([]);
      })
      .finally(() => {
        setIsLoadingEvents(false);
      });
  }, []);

  const filtered = events.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDeleteConfirm = async () => {
    if (deleteId) {
       try {
          await fetch(`${getBackendBaseUrl()}/api/v1/events/${deleteId}`, { method: "DELETE" });
          setEvents((prev) => prev.filter((e) => e.id !== deleteId));
       } catch (err) {
          console.error("Failed to delete event", err);
       }
    }
    setDeleteId(null);
  };

  const handleCloseAppConfirm = () => {
    setCloseAppId(null);
    setToast({ title: "Application closed", subtitle: "No new applicants can register for this event." });
  };

  const handleShare = (event: MockEvent) => {
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(url).catch(() => { });
    setToast({ title: "Copied to clipboard", subtitle: "Event link has been copied." });
  };

  const STATUS_OPTIONS: { value: EventStatus | "all"; label: string }[] = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "revision", label: "Revision" },
  ];

  const selectedLabel = STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "All Status";
  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.status === "active").length;

  return (
    <DashboardLayout>
      {toast && <Toast title={toast.title} subtitle={toast.subtitle} onClose={() => setToast(null)} />}

      {deleteId && (
        <ConfirmModal title="Delete Event"
          message="Are you sure you want to delete this event? This action cannot be undone."
          confirmLabel="Delete" confirmClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleDeleteConfirm} onCancel={() => setDeleteId(null)} />
      )}

      {closeAppId && (
        <ConfirmModal title="Close Applications"
          message="Once the application is closed, it cannot be reopened. Please confirm before continuing."
          confirmLabel="Confirm" confirmClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleCloseAppConfirm} onCancel={() => setCloseAppId(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm mx-3 mt-2 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "Chillax, sans-serif" }}>Your Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all your events</p>
        </div>
        <Link href="/events/new"
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={14} />
          New Event
        </Link>
      </div>

      <div className="px-3 py-4 flex flex-col gap-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
            <p className="text-sm text-gray-500 font-medium">Total Events</p>
            <p className="text-4xl font-semibold text-gray-900 mt-2" style={{ fontFamily: "Chillax, sans-serif" }}>{totalEvents}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
            <p className="text-sm text-gray-500 font-medium">Active Events</p>
            <p className="text-4xl font-semibold text-[#059669] mt-2" style={{ fontFamily: "Chillax, sans-serif" }}>{activeEvents}</p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0 flex items-center gap-2.5 bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 shadow-sm">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input type="text" placeholder="Search Event" value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none" />
          </div>
          <div ref={filterRef} className="relative flex-shrink-0">
            <button onClick={() => setFilterOpen((o) => !o)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition w-[120px] sm:w-[140px] justify-between">
              <span className="truncate">{selectedLabel}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${filterOpen ? "rotate-180" : ""}`} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-[140px]">
                {STATUS_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-gray-50 ${statusFilter === opt.value ? "bg-[#EEF5FC] text-[#3C7ACB] font-medium" : "text-gray-700"
                      }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event list */}
        {isLoadingEvents ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center gap-3">
            <CalendarDays size={52} className="text-gray-300" />
            <div className="text-center">
              <p className="text-base font-medium text-gray-700 mt-2">Loading events...</p>
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event}
                onDelete={(id) => setDeleteId(id)}
                onShare={handleShare}
                onCloseApp={(id) => setCloseAppId(id)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center gap-3">
            <CalendarDays size={52} className="text-gray-300" />
            <div className="text-center">
              <p className="text-base font-medium text-gray-700 mt-2">No events found</p>
              <p className="text-sm text-gray-400 mt-1">
                {search || statusFilter !== "all" ? "Try adjusting your search or filter" : "Get started by creating your first event"}
              </p>
            </div>
            {!search && statusFilter === "all" && (
              <Link href="/events/new"
                className="mt-2 flex items-center gap-2 bg-[#3C7ACB] hover:opacity-90 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition">
                <Plus size={14} />
                Create Event
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
