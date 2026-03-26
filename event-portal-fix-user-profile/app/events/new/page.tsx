"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DateInput from "@/components/DateInput";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Plus, Upload, Clock, ChevronDown, MapPin, Globe,
  Infinity, User, Trash2,
} from "lucide-react";
import { useEventCreate, AgendaDay } from "./EventCreateContext";

// ─── Data ─────────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  "Short Course", "Bootcamp", "Workshop", "Internship", "Volunteer Program",
  "Social Event", "Masterclass", "Conference", "Competition", "International Camp",
  "Self-Exploration Camp", "Summer Camp", "Field Trip", "Company Visit",
];

// ─── Date/Time helpers ────────────────────────────────────────────────────────

function parseTime(timeStr: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function validatePeriod(startDate: string, startTime: string, endDate: string, endTime: string): string | null {
  if (!startDate || !endDate) return null;
  if (endDate < startDate) return "End date must be after start date.";
  if (endDate === startDate) {
    const s = parseTime(startTime), e = parseTime(endTime);
    if (s !== null && e !== null && e <= s) return "End time must be after start time.";
  }
  return null;
}
function validateRegisterPeriod(startDate: string, startTime: string, endReg: string, endRegTime: string): string | null {
  if (!startDate || !startTime || !endReg || !endRegTime) return null;
  if (endReg > startDate) return "Registration must end before start date.";
  if (endReg === startDate) {
    const s = parseTime(endRegTime), e = parseTime(startTime);
    if (s !== null && e !== null && e <= s) return "Registration end time must be before event start time.";
  }
  return null;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function MultiSelect({ options, value, onChange, maxSelections = 3, placeholder = "Select event types" }: {
  options: string[]; value: string[]; onChange: (v: string[]) => void;
  maxSelections?: number; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt));
    else if (value.length < maxSelections) onChange([...value, opt]);
  };
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(!open)}
        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 cursor-pointer hover:border-[#3C7ACB] transition flex justify-between items-center">
        <span className={value.length === 0 ? "text-gray-400" : "text-gray-800"}>
          {value.length === 0 ? placeholder : value.join(", ")}
        </span>
        <ChevronDown size={16} />
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map(opt => (
            <div key={opt} onClick={() => toggle(opt)}
              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#EEF5FC] transition flex items-center gap-2 ${value.includes(opt) ? "bg-[#EEF5FC] text-[#3C7ACB]" : ""}`}>
              <input type="checkbox" checked={value.includes(opt)} readOnly
                className="w-4 h-4 rounded border-gray-300 accent-[#3C7ACB] pointer-events-none" />
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-7">{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-gray-900 mb-5" style={{ fontFamily: "Chillax, sans-serif" }}>{children}</h2>;
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>;
}
function Input({ placeholder, value, onChange, type = "text" }: { placeholder?: string; value: string; onChange: (v: string) => void; type?: string; }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] transition" />
  );
}
function Textarea({ placeholder, value, onChange, rows = 5 }: { placeholder?: string; value: string; onChange: (v: string) => void; rows?: number; }) {
  return (
    <textarea placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} rows={rows}
      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] transition resize-none" />
  );
}
function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>⚠</span>{message}</p>;
}
function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 text-sm text-[#3C7ACB] font-medium hover:opacity-80 transition mt-3">
      <Plus size={14} />{children}
    </button>
  );
}
function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition ${active ? "border-[#3C7ACB] bg-[#EEF5FC] text-[#3C7ACB]" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}>
      {children}
    </button>
  );
}
function InnerCard({ children }: { children: React.ReactNode }) {
  return <div className="border border-gray-100 rounded-xl px-5 py-4 bg-gray-50/40">{children}</div>;
}

// ─── Upload area — shows existing file preview when value is already set ──────

function UploadArea({ label, hint, value, onChange, aspectRatio }: {
  label: string; hint: string; value: File | null;
  onChange: (f: File | null) => void; aspectRatio?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(() => value ? URL.createObjectURL(value) : null);
  useEffect(() => {
    if (value && !preview) setPreview(URL.createObjectURL(value));
    if (!value) setPreview(null);
  }, [value, preview]);
  const handleFile = (f: File) => { onChange(f); setPreview(URL.createObjectURL(f)); };
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p className="text-xs text-gray-400 mb-2">{hint}</p>
      <div onClick={() => ref.current?.click()} onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className={`border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition overflow-hidden ${aspectRatio ?? ""}`}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4">
            <Upload size={28} className="text-gray-400" />
            <p className="text-sm text-gray-500 font-medium">Upload Image</p>
            <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/png,image/jpeg" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

// ─── TimePicker ───────────────────────────────────────────────────────────────

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void; }) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState("10");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const ref = useRef<HTMLDivElement>(null);
  const hours = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const confirm = (h: string, m: string, p: string) => onChange(`${h}:${m} ${p}`);
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 cursor-pointer hover:border-[#3C7ACB] transition w-36">
        <Clock size={14} className="text-gray-400" />
        <span className={value ? "text-gray-800" : "text-gray-400"}>{value || `${hour}:${minute} ${period}`}</span>
      </div>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="flex">
            <div className="flex flex-col overflow-y-auto h-48 w-14 border-r border-gray-100">
              {hours.map(h => (
                <button key={h} type="button" onClick={() => { setHour(h); confirm(h, minute, period); }}
                  className={`py-2 text-sm font-medium text-center hover:bg-[#EEF5FC] transition ${hour === h ? "bg-[#3C7ACB] text-white" : "text-gray-700"}`}>{h}</button>
              ))}
            </div>
            <div className="flex flex-col overflow-y-auto h-48 w-14 border-r border-gray-100">
              {minutes.map(m => (
                <button key={m} type="button" onClick={() => { setMinute(m); confirm(hour, m, period); }}
                  className={`py-2 text-sm font-medium text-center hover:bg-[#EEF5FC] transition ${minute === m ? "bg-[#3C7ACB] text-white" : "text-gray-700"}`}>{m}</button>
              ))}
            </div>
            <div className="flex flex-col w-14">
              {(["AM", "PM"] as const).map(p => (
                <button key={p} type="button" onClick={() => { setPeriod(p); confirm(hour, minute, p); setOpen(false); }}
                  className={`py-3 text-sm font-medium text-center hover:bg-[#EEF5FC] transition ${period === p ? "bg-[#3C7ACB] text-white" : "text-gray-700"}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const ctx = useEventCreate();
  const {
    eventName, setEventName, eventType, setEventType, overview, setOverview,
    smallBanner, setSmallBanner, largeBanner, setLargeBanner,
    tba, setTba, eventDate, setEventDate, eventTime, setEventTime,
    timezone, setTimezone, eventEndDate, setEventEndDate, eventEndTime, setEventEndTime,
    regStart, setRegStart, regStartTime, setRegStartTime,
    regEnd, setRegEnd, regEndTime, setRegEndTime,
    days, setDays, locationType, setLocationType,
    locationName, setLocationName, locationAddress, setLocationAddress,
    city, setCity, country, setCountry, mapsLink, setMapsLink,
    seatsType, setSeatsType, numSeats, setNumSeats,
    outcomes, setOutcomes, speakers, setSpeakers,
  } = ctx;

  // ── Derived agenda mode ──────────────────────────────────────────────────
  const isMultiDay = !tba && !!eventDate && !!eventEndDate && eventDate !== eventEndDate;
  const isSingleDay = !tba && !!eventDate && !!eventEndDate && eventDate === eventEndDate;

  useEffect(() => {
    if (tba || !eventDate || !eventEndDate) return;
    if (eventDate === eventEndDate) {
      setDays(prev => [{ ...prev[0], date: eventDate }]);
    } else {
      setDays(prev => {
        const firstDay: AgendaDay = { ...prev[0], date: eventDate };
        const lastDay: AgendaDay =
          prev.length > 1
            ? { ...prev[prev.length - 1], date: eventEndDate }
            : { id: Date.now(), date: eventEndDate, slots: [{ id: 1, time: "", activity: "" }] };
        const middle = prev.length > 2 ? prev.slice(1, -1) : [];
        return [firstDay, ...middle, lastDay];
      });
    }
  }, [eventDate, eventEndDate, tba, setDays]);

  // ── Validation ───────────────────────────────────────────────────────────
  const eventPeriodError = validatePeriod(eventDate, eventTime, eventEndDate, eventEndTime);
  const regPeriodError = validatePeriod(regStart, regStartTime, regEnd, regEndTime);
  const eventRegPeriod = validateRegisterPeriod(eventDate, eventTime, regEnd, regEndTime);

  const isDateInRange = (d: string) => {
    if (!eventDate || !eventEndDate || tba) return true;
    return d >= eventDate && d <= eventEndDate;
  };

  const canProceed = useMemo(() => {
    // Basic info
    if (!eventName.trim()) return false;
    if (eventType.split(",").filter(Boolean).length === 0) return false;
    if (!overview.trim()) return false;
    // Banners
    if (!smallBanner && !editId) return false;
    if (!largeBanner && !editId) return false;
    // Event dates
    if (!tba) {
      if (!eventDate || !eventTime || !eventEndDate || !eventEndTime) return false;
      if (eventPeriodError) return false;
    }
    // Registration period
    if (!regStart || !regStartTime || !regEnd || !regEndTime) return false;
    if (regPeriodError || eventRegPeriod) return false;
    // Agenda — every slot needs time + activity; non-fixed days need a date in range
    for (let di = 0; di < days.length; di++) {
      const day = days[di];
      const isFirstFixed = isMultiDay && di === 0;
      const isLastFixed = isMultiDay && di === days.length - 1;
      const isSingleFixed = isSingleDay && di === 0;
      const fixed = isFirstFixed || isLastFixed || isSingleFixed;
      if (!fixed && !day.date.trim()) return false;
      if (!fixed && day.date && !isDateInRange(day.date)) return false;
      for (const slot of day.slots) {
        if (!slot.time || !slot.activity.trim()) return false;
      }
    }
    // Location (onsite)
    if (locationType === "onsite") {
      if (!locationName.trim() || !locationAddress.trim() || !city.trim() || !country.trim()) return false;
    }
    // Seats
    if (seatsType === "limited") {
      if (!numSeats || Number(numSeats) <= 0) return false;
    }
    // Outcomes
    for (const o of outcomes) {
      if (!o.title.trim() || !o.description.trim()) return false;
    }
    // Speakers
    for (const s of speakers) {
      if (!s.name.trim() || !s.position.trim() || !s.bio.trim() || (!s.photo && !editId)) return false;
    }
    return true;
  }, [
    eventName, eventType, overview, smallBanner, largeBanner, tba,
    eventDate, eventTime, eventEndDate, eventEndTime, eventPeriodError,
    regStart, regStartTime, regEnd, regEndTime, regPeriodError, eventRegPeriod,
    days, isMultiDay, isSingleDay,
    locationType, locationName, locationAddress, city, country,
    seatsType, numSeats, outcomes, speakers, editId
  ]);

  // ── Agenda helpers ───────────────────────────────────────────────────────
  const addDay = () => {
    const newDay: AgendaDay = { id: Date.now(), date: "", slots: [{ id: 1, time: "", activity: "" }] };
    if (isMultiDay) setDays(prev => [...prev.slice(0, -1), newDay, prev[prev.length - 1]]);
    else setDays(prev => [...prev, newDay]);
  };
  const removeDay = (id: number) => setDays(days.filter(d => d.id !== id));
  const updateDayDate = (id: number, date: string) => setDays(days.map(d => d.id === id ? { ...d, date } : d));
  const addSlot = (dayId: number) => setDays(days.map(d => d.id === dayId ? { ...d, slots: [...d.slots, { id: Date.now(), time: "", activity: "" }] } : d));
  const removeSlot = (dayId: number, slotId: number) => setDays(days.map(d => d.id === dayId ? { ...d, slots: d.slots.filter(s => s.id !== slotId) } : d));
  const updateSlot = (dayId: number, slotId: number, field: "time" | "activity", value: string) =>
    setDays(days.map(d => d.id === dayId ? { ...d, slots: d.slots.map(s => s.id === slotId ? { ...s, [field]: value } : s) } : d));

  const addOutcome = () => setOutcomes([...outcomes, { id: outcomes.length + 1, title: "", description: "" }]);
  const removeOutcome = (id: number) => setOutcomes(outcomes.filter(o => o.id !== id));
  const updateOutcome = (id: number, field: "title" | "description", value: string) =>
    setOutcomes(outcomes.map(o => o.id === id ? { ...o, [field]: value } : o));

  const addSpeaker = () => setSpeakers([...speakers, { id: speakers.length + 1, name: "", position: "", bio: "", photo: null, photoPreview: null }]);
  const removeSpeaker = (id: number) => setSpeakers(speakers.filter(s => s.id !== id));
  const updateSpeaker = (id: number, field: "name" | "position" | "bio", value: string) =>
    setSpeakers(speakers.map(s => s.id === id ? { ...s, [field]: value } : s));
  const updateSpeakerPhoto = (id: number, file: File) =>
    setSpeakers(speakers.map(s => s.id === id ? { ...s, photo: file, photoPreview: URL.createObjectURL(file) } : s));
  const speakerPhotoRefs = useRef<Record<number, HTMLInputElement | null>>({});

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm mx-3 mt-2 rounded-2xl shadow-sm">
        <Link href="/events" className="text-gray-500 hover:text-gray-700 transition"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "Chillax, sans-serif" }}>{"Create New Event"}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details below to publish your event</p>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-5">

        {/* 1. Basic Information */}
        <SectionCard>
          <SectionTitle>Basic Information</SectionTitle>
          <div className="mb-4">
            <FieldLabel>Event Name</FieldLabel>
            <Input placeholder="Enter event name" value={eventName} onChange={setEventName} />
          </div>
          <div className="mb-4">
            <FieldLabel>Type of Event (up to 3)</FieldLabel>
            <MultiSelect options={EVENT_TYPES}
              value={eventType.split(",").filter(Boolean)}
              onChange={vals => setEventType(vals.join(","))} />
          </div>
          <div>
            <FieldLabel>Event Overview</FieldLabel>
            <p className="text-xs text-gray-400 mb-2 leading-relaxed">
              Please provide a brief overview of your organization and the event. Describe what the event is about, its type, and main purpose.
            </p>
            <Textarea placeholder="Enter event overview..." value={overview} onChange={setOverview} />
          </div>
        </SectionCard>

        {/* 2. Event Banners */}
        <SectionCard>
          <SectionTitle>Event Banners</SectionTitle>
          <div className="grid grid-cols-2 gap-5">
            <UploadArea label="Small Banner" hint="Recommended: 255x140px" value={smallBanner} onChange={setSmallBanner} aspectRatio="aspect-[255/140]" />
            <UploadArea label="Large Banner" hint="Recommended: 1324x240px" value={largeBanner} onChange={setLargeBanner} aspectRatio="aspect-[255/140] lg:aspect-[1324/240]" />
          </div>
        </SectionCard>

        {/* 3. Date & Time */}
        <SectionCard>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <SectionTitle>Date & Time</SectionTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Timezone</span>
              <div className="relative">
                <select value={timezone} onChange={e => setTimezone(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] bg-white">
                  {["GMT-8", "GMT-5", "GMT+0", "GMT+1", "GMT+3", "GMT+5", "GMT+7", "GMT+8", "GMT+9"].map(tz => <option key={tz}>{tz}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <FieldLabel>Event Period</FieldLabel>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input type="checkbox" checked={tba} onChange={e => setTba(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-[#3C7ACB]" />
              <span className="text-sm text-gray-600">To be announced</span>
            </label>
            {!tba && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Start Date & Time</p>
                    <div className="flex gap-2">
                      <DateInput value={eventDate} onChange={setEventDate} className="flex-1 min-w-0" />
                      <TimePicker value={eventTime} onChange={setEventTime} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">End Date & Time</p>
                    <div className="flex gap-2">
                      <DateInput value={eventEndDate ?? ""} onChange={setEventEndDate}
                        className={`flex-1 min-w-0 ${eventPeriodError ? "border-red-400" : ""}`} />
                      <TimePicker value={eventEndTime ?? ""} onChange={setEventEndTime} />
                    </div>
                  </div>
                </div>
                <FieldError message={eventPeriodError} />
              </>
            )}
          </div>

          <div>
            <FieldLabel>Registration Period</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Start Date & Time</p>
                <div className="flex gap-2">
                  <DateInput value={regStart} onChange={setRegStart} className="flex-1 min-w-0" />
                  <TimePicker value={regStartTime} onChange={setRegStartTime} />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">End Date & Time</p>
                <div className="flex gap-2">
                  <DateInput value={regEnd} onChange={setRegEnd}
                    className={`flex-1 min-w-0 ${regPeriodError || eventRegPeriod ? "border-red-400" : ""}`} />
                  <TimePicker value={regEndTime} onChange={setRegEndTime} />
                </div>
              </div>
            </div>
            <FieldError message={regPeriodError || eventRegPeriod} />
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Note: If the event duration changes you may update it later through the system.
            </p>
          </div>
        </SectionCard>

        {/* 4. Agenda */}
        <SectionCard>
          <SectionTitle>Event&apos;s Agenda</SectionTitle>
          <p className="text-xs text-gray-400 mb-4 -mt-3 leading-relaxed">
            Every day must have a date, and every time slot must have both a time and activity filled in.
          </p>
          <div className="flex flex-col gap-4">
            {days.map((day, di) => {
              const isFirstFixed = isMultiDay && di === 0;
              const isLastFixed = isMultiDay && di === days.length - 1;
              const isSingleFixed = isSingleDay && di === 0;
              const isFixed = isFirstFixed || isLastFixed;
              const canRemove = !isFixed && di > 0;
              return (
                <div key={day.id} className="flex flex-col gap-0">
                  <InnerCard>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-700">Day {di + 1}</p>
                        {isFixed && (
                          <span className="text-xs text-[#3C7ACB] bg-[#EEF5FC] px-2 py-0.5 rounded-full font-medium">
                            {isFirstFixed ? "Event Start" : "Event End"}
                          </span>
                        )}
                      </div>
                      {canRemove && (
                        <button type="button" onClick={() => removeDay(day.id)}
                          className="text-gray-400 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50"><Trash2 size={15} /></button>
                      )}
                    </div>
                    <div className="mb-3">
                      <FieldLabel>Date</FieldLabel>
                      {isFixed || isSingleFixed ? (
                        <div className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-500 bg-gray-50 select-none">{day.date || "—"}</div>
                      ) : (
                        <>
                          <DateInput value={day.date} onChange={v => updateDayDate(day.id, v)} />
                          {day.date && !isDateInRange(day.date) && (
                            <p className="text-xs text-red-600 mt-1">Date must be between event start ({eventDate}) and end ({eventEndDate})</p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {day.slots.map((slot, si) => (
                        <div key={slot.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <TimePicker value={slot.time} onChange={v => updateSlot(day.id, slot.id, "time", v)} />
                          <input type="text" placeholder="Activity description" value={slot.activity}
                            onChange={e => updateSlot(day.id, slot.id, "activity", e.target.value)}
                            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] transition" />
                          {si > 0 && (
                            <button type="button" onClick={() => removeSlot(day.id, slot.id)}
                              className="text-gray-400 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50 flex-shrink-0 self-center"><Trash2 size={15} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                    <AddButton onClick={() => addSlot(day.id)}>Add Time Slot</AddButton>
                  </InnerCard>
                  {isMultiDay && isFirstFixed && <AddButton onClick={addDay}>Add Another Day</AddButton>}
                </div>
              );
            })}
          </div>
          {!isMultiDay && !isSingleDay && <AddButton onClick={addDay}>Add Another Day</AddButton>}
        </SectionCard>

        {/* 5. Location */}
        <SectionCard>
          <SectionTitle>Location</SectionTitle>
          <div className="flex gap-3 mb-5">
            <ToggleButton active={locationType === "onsite"} onClick={() => setLocationType("onsite")}><MapPin size={16} />Onsite</ToggleButton>
            <ToggleButton active={locationType === "online"} onClick={() => setLocationType("online")}><Globe size={16} />Online</ToggleButton>
          </div>
          {locationType === "onsite" ? (
            <div className="flex flex-col gap-4">
              <div><FieldLabel>Location Name</FieldLabel><Input placeholder="e.g., Grand Ballroom, Convention Center" value={locationName} onChange={setLocationName} /></div>
              <div><FieldLabel>Location Address</FieldLabel><Input placeholder="Full address" value={locationAddress} onChange={setLocationAddress} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><FieldLabel>City</FieldLabel><Input placeholder="City name" value={city} onChange={setCity} /></div>
                <div><FieldLabel>Country</FieldLabel><Input placeholder="Country name" value={country} onChange={setCountry} /></div>
              </div>
              <div><FieldLabel>Google Maps Link</FieldLabel><Input placeholder="https://maps.google.com/..." value={mapsLink} onChange={setMapsLink} /></div>
            </div>
          ) : (
            <div className="border border-gray-100 rounded-xl bg-gray-50/50 py-10 flex flex-col items-center justify-center gap-2">
              <Globe size={36} className="text-[#3C7ACB]" />
              <p className="text-sm font-medium text-gray-700">Online Event</p>
              <p className="text-xs text-gray-400">No location details required for online events</p>
            </div>
          )}
        </SectionCard>

        {/* 6. Available Seats */}
        <SectionCard>
          <SectionTitle>Available Seats</SectionTitle>
          <div className="flex gap-3 mb-5">
            <ToggleButton active={seatsType === "limited"} onClick={() => setSeatsType("limited")}>Limited Seats</ToggleButton>
            <ToggleButton active={seatsType === "unlimited"} onClick={() => setSeatsType("unlimited")}><Infinity size={16} />Open (Unlimited)</ToggleButton>
          </div>
          {seatsType === "limited" ? (
            <div><FieldLabel>Number of Seats</FieldLabel><Input placeholder="e.g., 100" value={numSeats} onChange={setNumSeats} type="number" /></div>
          ) : (
            <div>
              <FieldLabel>Number of Seats</FieldLabel>
              <input value="Unlimited" disabled className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed" />
            </div>
          )}
        </SectionCard>

        {/* 7. Learning Outcomes */}
        <SectionCard>
          <SectionTitle>Learning Outcomes &amp; Benefits</SectionTitle>
          <p className="text-xs text-gray-400 mb-4 -mt-3 leading-relaxed">Describe the key benefits participants will gain. Every outcome must have a title and description.</p>
          <div className="flex flex-col gap-4">
            {outcomes.map((o, oi) => (
              <InnerCard key={o.id}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Outcome {oi + 1}</p>
                  {oi > 0 && <button type="button" onClick={() => removeOutcome(o.id)} className="text-gray-400 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50"><Trash2 size={15} /></button>}
                </div>
                <div className="mb-3"><FieldLabel>Title</FieldLabel><Input placeholder="Outcome title" value={o.title} onChange={v => updateOutcome(o.id, "title", v)} /></div>
                <div><FieldLabel>Description</FieldLabel><Textarea placeholder="Brief description..." value={o.description} onChange={v => updateOutcome(o.id, "description", v)} rows={3} /></div>
              </InnerCard>
            ))}
          </div>
          <AddButton onClick={addOutcome}>Add Another Outcome</AddButton>
        </SectionCard>

        {/* 8. Speakers */}
        <SectionCard>
          <SectionTitle>Speakers</SectionTitle>
          <p className="text-xs text-gray-400 mb-4 -mt-3 leading-relaxed">Every speaker requires a photo, name, position, and biography.</p>
          <div className="flex flex-col gap-4">
            {speakers.map((s, si) => (
              <InnerCard key={s.id}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-700">Speaker {si + 1}</p>
                  {si > 0 && <button type="button" onClick={() => removeSpeaker(s.id)} className="text-gray-400 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50"><Trash2 size={15} /></button>}
                </div>
                <div className="mb-4">
                  <FieldLabel>Image</FieldLabel>
                  <div className="flex items-center gap-4">
                    <div onClick={() => speakerPhotoRefs.current[s.id]?.click()}
                      className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#3C7ACB] transition overflow-hidden bg-gray-50 flex-shrink-0">
                      {s.photoPreview
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={s.photoPreview} alt="speaker" className="w-full h-full object-cover" />
                        : <User size={24} className="text-gray-300" />}
                    </div>
                    <div><p className="text-sm text-gray-500">Click to upload an image</p><p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB</p></div>
                    <input ref={el => { speakerPhotoRefs.current[s.id] = el; }} type="file" accept="image/png,image/jpeg" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) updateSpeakerPhoto(s.id, f); }} />
                  </div>
                </div>
                <div className="mb-3"><FieldLabel>Name</FieldLabel><Input placeholder="Full name" value={s.name} onChange={v => updateSpeaker(s.id, "name", v)} /></div>
                <div className="mb-3"><FieldLabel>Current Position</FieldLabel><Input placeholder="e.g., CEO at Tech Company" value={s.position} onChange={v => updateSpeaker(s.id, "position", v)} /></div>
                <div><FieldLabel>Biography</FieldLabel><Textarea placeholder="Brief background and expertise..." value={s.bio} onChange={v => updateSpeaker(s.id, "bio", v)} rows={3} /></div>
              </InnerCard>
            ))}
          </div>
          <AddButton onClick={addSpeaker}>Add Another Speaker</AddButton>
        </SectionCard>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link href="/events" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancel</Link>
          <button
            type="button"
            disabled={!canProceed}
            onClick={() => { if (canProceed) router.push("/events/new/optional"); }}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition shadow-sm ${canProceed ? "text-white bg-[#3C7ACB] hover:opacity-90" : "text-gray-400 bg-gray-200 cursor-not-allowed"}`}
          >
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
