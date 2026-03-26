"use client";

import { useState } from "react";
import { use } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Toast from "@/components/Toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Pencil, Eye, Users, Lock, CalendarDays,
  MapPin, Clock, Download, Mail, Phone, AlertCircle,
} from "lucide-react";
import { mockEvents, EventStatus, STATUS_STYLES } from "@/lib/mockEvents";

function StatusBadge({ status }: { status: EventStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const event = mockEvents.find((e) => e.id === eventId);

  const [activeTab, setActiveTab] = useState<"overview" | "applicants">("overview");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [toast, setToast] = useState<{ title: string; subtitle: string } | null>(null);

  if (!event) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 py-24">
          <p className="text-lg font-medium">Event not found</p>
          <Link href="/events" className="text-[#3C7ACB] text-sm hover:underline">← Back to events</Link>
        </div>
      </DashboardLayout>
    );
  }

  const availableSeats = event.totalSeats - event.filledSeats;

  const handleLockClick = () => {
    if (isClosed) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } else {
      setShowCloseModal(true);
    }
  };

  const handleCloseConfirm = () => {
    setShowCloseModal(false);
    setIsClosed(true);
    setToast({ title: "Application closed", subtitle: "No new applicants can register for this event." });
  };

  return (
    <DashboardLayout>
      {toast && <Toast title={toast.title} subtitle={toast.subtitle} onClose={() => setToast(null)} />}

      {/* Close registration modal */}
      {showCloseModal && (
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
              <h2 className="text-base font-bold text-gray-900 mb-1.5">Close Applications</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Once the application is closed, it cannot be reopened. Please confirm before continuing.</p>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-end gap-3 px-6 py-4">
              <button onClick={() => setShowCloseModal(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleCloseConfirm}
                className="px-5 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shake keyframes injected inline */}
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-4px)}
          40%{transform:translateX(4px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
        .shake{animation:shake 0.4s ease-in-out;}
      `}</style>

      {/* Page header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white/79 backdrop-blur-sm mx-3 mt-2 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button onClick={() => router.back()} className="mt-1 text-gray-500 hover:text-gray-700 transition flex-shrink-0">
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate" style={{ fontFamily: "Chillax, sans-serif" }}>
                {event.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusBadge status={event.status} />
                <span className="text-sm text-gray-500">{event.type}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 pl-9 sm:pl-0">
            <Link href={`/events/new?editId=${event.id}`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <Pencil size={14} />
              Edit Event
            </Link>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#3C7ACB] hover:opacity-90 rounded-lg transition">
              <Eye size={14} />
              View Event
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Applicants</p>
                <p className="text-4xl font-semibold text-gray-900 mt-2" style={{ fontFamily: "Chillax, sans-serif" }}>
                  {event.applicants.length}
                </p>
              </div>
              <Users size={22} className="text-[#3C7ACB]" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Seats</p>
                <p className="text-4xl font-semibold text-gray-900 mt-2" style={{ fontFamily: "Chillax, sans-serif" }}>
                  {availableSeats}
                </p>
                <p className="text-sm text-gray-400 mt-1">of {event.totalSeats} total</p>
              </div>
              <Users size={22} className="text-teal-500" />
            </div>
            <button
              onClick={handleLockClick}
              title={isClosed ? "Applications closed" : "Close Applications"}
              className={`absolute bottom-4 right-4 transition ${shaking ? "shake" : ""} ${isClosed ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}>
              <Lock size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(["overview", "applicants"] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-6 py-3.5 text-sm font-medium transition border-b-2 ${activeTab === t ? "text-[#3C7ACB] border-[#3C7ACB]" : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}>
                {t === "overview" ? "Event Overview" : `Applicant List (${event.applicants.length})`}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="p-6">
              <div className="rounded-xl overflow-hidden mb-6 max-h-72 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.image} alt={event.name} className="w-full h-72 object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Event Information</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <CalendarDays size={18} className="text-[#3C7ACB] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Event Dates</p>
                        {event.eventDates.map((d, i) => <p key={i} className="text-sm text-gray-500 mt-0.5">{d}</p>)}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-[#3C7ACB] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Location</p>
                        <p className="text-sm text-gray-500 mt-0.5">{event.locationName}</p>
                        {event.locationAddress && <p className="text-sm text-gray-500">{event.locationAddress}</p>}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users size={18} className="text-[#3C7ACB] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Capacity</p>
                        <p className="text-sm text-gray-500 mt-0.5">{event.totalSeats} total seats ({availableSeats} available)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={18} className="text-[#3C7ACB] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Registration Period</p>
                        <p className="text-sm text-gray-500 mt-0.5">{event.registrationPeriod}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              </div>
              <div className="mt-6 bg-gray-50 rounded-xl border border-gray-100 px-5 py-4">
                <p className="text-sm font-semibold text-gray-800 mb-3">Registration Status</p>
                <p className="text-xs text-gray-500 mb-1">Total Applicants</p>
                <p className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "Chillax, sans-serif" }}>{event.applicants.length}</p>
              </div>
            </div>
          )}

          {/* Applicants */}
          {activeTab === "applicants" && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Applicant List</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Manage event registrations and applications</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  <Download size={14} /> Export CSV
                </button>
              </div>
              {event.applicants.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No applicants yet.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 pb-3 w-1/3">Applicant</th>
                      <th className="text-left text-xs font-semibold text-gray-500 pb-3 w-1/3">Contact</th>
                      <th className="text-left text-xs font-semibold text-gray-500 pb-3">Applied Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.applicants.map((a) => (
                      <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#3C7ACB] flex items-center justify-center text-white text-xs font-semibold">
                              {a.initials}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{a.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Mail size={13} className="text-gray-400" />{a.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Phone size={13} className="text-gray-400" />{a.phone}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-sm text-gray-600">{a.appliedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
