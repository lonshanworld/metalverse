"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { mockEvents } from "@/lib/mockEvents";
import { getBackendBaseUrl } from "@/shared/config/data-mode";

// ─── Shared types (imported by all pages in the flow) ─────────────────────────

export interface AgendaSlot  { id: number; time: string; activity: string; }
export interface AgendaDay   { id: number; date: string; slots: AgendaSlot[]; }
export interface Outcome     { id: number; title: string; description: string; }
export interface Speaker     { id: number; name: string; position: string; bio: string; photo: File | null; photoPreview: string | null; }
export interface GalleryFile { id: number; file: File; preview: string; }
export type Distribution = "all" | "specific";
export interface NameBox { x: number; y: number; w: number; h: number; }
export interface Credential {
  id: number;
  awardName: string;
  color: string;
  colorName: string;
  logo: File | null;
  logoPreview: string | null;
  certTemplate: File | null;
  certPreview: string | null;
  certIsPdf: boolean;
  nameBox: NameBox;
  issuedDate: string;
  rank: string;
  distribution: Distribution;
  numParticipants: string;
  requirements: string;
}

export function makeCredential(id: number): Credential {
  return {
    id, awardName: "", color: "#10b981", colorName: "Success Green",
    logo: null, logoPreview: null,
    certTemplate: null, certPreview: null, certIsPdf: false,
    nameBox: { x: -1, y: -1, w: 38, h: 9 },
    issuedDate: "", rank: "", distribution: "all", numParticipants: "", requirements: "",
  };
}

// ─── Context type ─────────────────────────────────────────────────────────────

interface Ctx {
  editId: string | null;
  // ── Page 1: Basic info ─────────────────────────────────────────────────────
  eventName: string;       setEventName: (v: string) => void;
  eventType: string;       setEventType: (v: string) => void;
  overview:  string;       setOverview:  (v: string) => void;
  smallBanner: File | null; setSmallBanner: (f: File | null) => void;
  largeBanner: File | null; setLargeBanner: (f: File | null) => void;
  tba: boolean;             setTba: (v: boolean) => void;
  eventDate:    string;    setEventDate:    (v: string) => void;
  eventTime:    string;    setEventTime:    (v: string) => void;
  timezone:     string;    setTimezone:     (v: string) => void;
  eventEndDate: string;    setEventEndDate: (v: string) => void;
  eventEndTime: string;    setEventEndTime: (v: string) => void;
  regStart:     string;    setRegStart:     (v: string) => void;
  regStartTime: string;    setRegStartTime: (v: string) => void;
  regEnd:       string;    setRegEnd:       (v: string) => void;
  regEndTime:   string;    setRegEndTime:   (v: string) => void;
  days: AgendaDay[];       setDays: (d: AgendaDay[] | ((prev: AgendaDay[]) => AgendaDay[])) => void;
  locationType: "onsite" | "online"; setLocationType: (v: "onsite" | "online") => void;
  locationName:    string; setLocationName:    (v: string) => void;
  locationAddress: string; setLocationAddress: (v: string) => void;
  city:    string;         setCity:    (v: string) => void;
  country: string;         setCountry: (v: string) => void;
  mapsLink: string;        setMapsLink: (v: string) => void;
  seatsType: "limited" | "unlimited"; setSeatsType: (v: "limited" | "unlimited") => void;
  numSeats: string;        setNumSeats: (v: string) => void;
  outcomes: Outcome[];     setOutcomes: (o: Outcome[]) => void;
  speakers: Speaker[];     setSpeakers: (s: Speaker[]) => void;

  // ── Page 2: Optional ───────────────────────────────────────────────────────
  eligibilitySelected: string[];   setEligibilitySelected: (v: string[]) => void;
  galleryFiles: GalleryFile[];     setGalleryFiles: (v: GalleryFile[] | ((prev: GalleryFile[]) => GalleryFile[])) => void;

  // ── Page 3: Credentials ────────────────────────────────────────────────────
  credentials: Credential[];
  setCredentials: (c: Credential[] | ((prev: Credential[]) => Credential[])) => void;

  // ── Page 5: Conditions ─────────────────────────────────────────────────────
  termsText:      string;         setTermsText:      (v: string) => void;
  termsFile:      File | null;    setTermsFile:      (f: File | null) => void;
  requireConsent: boolean;        setRequireConsent: (v: boolean) => void;
}

// ─── Default context (never actually used — provider is always present) ───────

const EventCreateContext = createContext<Ctx>({} as Ctx);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function EventCreateProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const rawEditId = searchParams.get("editId");
  const [editId, setEditId] = useState<string | null>(rawEditId);

  useEffect(() => {
    if (rawEditId && !editId) {
      setEditId(rawEditId);
    }
  }, [rawEditId, editId]);

  const TEXT_KEY = "mv_event_create_draft";
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Page 1
  const [eventName,       setEventName]       = useState("");
  const [eventType,       setEventType]       = useState("");
  const [overview,        setOverview]        = useState("");
  const [smallBanner,     setSmallBanner]     = useState<File | null>(null);
  const [largeBanner,     setLargeBanner]     = useState<File | null>(null);
  const [tba,             setTba]             = useState(false);
  const [eventDate,       setEventDate]       = useState("");
  const [eventTime,       setEventTime]       = useState("");
  const [timezone,        setTimezone]        = useState("GMT+7");
  const [eventEndDate,    setEventEndDate]    = useState("");
  const [eventEndTime,    setEventEndTime]    = useState("");
  const [regStart,        setRegStart]        = useState("");
  const [regStartTime,    setRegStartTime]    = useState("");
  const [regEnd,          setRegEnd]          = useState("");
  const [regEndTime,      setRegEndTime]      = useState("");
  const [days,            setDays]            = useState<AgendaDay[]>([{ id: 1, date: "", slots: [{ id: 1, time: "", activity: "" }] }]);
  const [locationType,    setLocationType]    = useState<"onsite" | "online">("onsite");
  const [locationName,    setLocationName]    = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [city,            setCity]            = useState("");
  const [country,         setCountry]         = useState("");
  const [mapsLink,        setMapsLink]        = useState("");
  const [seatsType,       setSeatsType]       = useState<"limited" | "unlimited">("limited");
  const [numSeats,        setNumSeats]        = useState("");
  const [outcomes,        setOutcomes]        = useState<Outcome[]>([{ id: 1, title: "", description: "" }]);
  const [speakers,        setSpeakers]        = useState<Speaker[]>([{ id: 1, name: "", position: "", bio: "", photo: null, photoPreview: null }]);

  // Page 2
  const [eligibilitySelected, setEligibilitySelected] = useState<string[]>([]);
  const [galleryFiles,        setGalleryFiles]         = useState<GalleryFile[]>([]);

  // Page 3
  const [credentials, setCredentials] = useState<Credential[]>([makeCredential(1)]);

  // Page 5
  const [termsText,      setTermsText]      = useState("");
  const [termsFile,      setTermsFile]      = useState<File | null>(null);
  const [requireConsent, setRequireConsent] = useState(true);

  // ── Restore text-only fields from localStorage on first mount ──────────────
  useEffect(() => {
    if (editId) {
      fetch(`${getBackendBaseUrl()}/api/v1/events/${editId}`)
        .then(res => res.json())
        .then(event => {
          if (event) {
            if (event.name) setEventName(event.name);
            if (event.event_type_raw) setEventType(event.event_type_raw);
            if (event.description || event.short_description) setOverview(event.description || event.short_description);
            if (event.capacity != null) {
              setSeatsType(event.capacity > 0 ? "limited" : "unlimited");
              setNumSeats(event.capacity.toString());
            }
            if (event.location) {
              setLocationName(event.location.name || "");
              setLocationAddress(event.location.address1 || "");
              setCity(event.location.province || "");
              setCountry(event.location.country || "");
            }
            if (event.start_at) {
              const date = new Date(event.start_at);
              if (!isNaN(date.getTime())) {
                setEventDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
                let h = date.getHours();
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12;
                h = h ? h : 12;
                setEventTime(`${String(h).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${ampm}`);
              }
            }
            if (event.end_at) {
              const date = new Date(event.end_at);
              if (!isNaN(date.getTime())) {
                setEventEndDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
                let h = date.getHours();
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12;
                h = h ? h : 12;
                setEventEndTime(`${String(h).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${ampm}`);
              }
            }
            if (event.timezone) setTimezone(event.timezone);
            if (event.registration_start_at) {
              const date = new Date(event.registration_start_at);
              if (!isNaN(date.getTime())) {
                setRegStart(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
                let h = date.getHours(); const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12; h = h || 12;
                setRegStartTime(`${String(h).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${ampm}`);
              }
            }
            if (event.registration_end_at) {
              const date = new Date(event.registration_end_at);
              if (!isNaN(date.getTime())) {
                setRegEnd(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
                let h = date.getHours(); const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12; h = h || 12;
                setRegEndTime(`${String(h).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${ampm}`);
              }
            }
            if (event.hydration_payload) {
               try {
                 const hp = JSON.parse(event.hydration_payload);
                 if (hp.agenda && Array.isArray(hp.agenda)) {
                    setDays(hp.agenda.map((d: any, i: number) => ({
                        id: i + 1, date: d.date, 
                        slots: d.slots.map((s: any, j: number) => ({ id: j + 1, time: s.time, activity: s.activity }))
                    })));
                 }
                 if (hp.outcomes && Array.isArray(hp.outcomes)) {
                    setOutcomes(hp.outcomes.map((o: any, i: number) => ({ id: i + 1, title: o.title, description: o.description })));
                 }
                 if (hp.speakers && Array.isArray(hp.speakers)) {
                    setSpeakers(hp.speakers.map((s: any, i: number) => ({ id: i + 1, name: s.name, position: s.position, bio: s.bio, photo: null, photoPreview: null })));
                 }
                 if (hp.eligibility && Array.isArray(hp.eligibility)) setEligibilitySelected(hp.eligibility);
                 if (hp.credentials && Array.isArray(hp.credentials)) {
                    setCredentials(hp.credentials.map((c: any, i: number) => ({
                       id: i + 1, awardName: c.award_name, color: c.color, colorName: "Theme Match",
                       logo: null, logoPreview: null, certTemplate: null, certPreview: null, certIsPdf: false,
                       nameBox: c.name_box, issuedDate: c.issued_date, rank: c.rank, distribution: c.distribution, 
                       numParticipants: c.num_participants != null ? c.num_participants.toString() : "", requirements: c.requirements
                    })));
                 }
               } catch(e) { console.error("Could not parse hydration payload", e); }
            }
          }
        })
        .catch(err => console.error("Failed to load event data", err))
        .finally(() => {
          setDraftLoaded(true);
        });
      return;
    }

    try {
      const raw = localStorage.getItem(TEXT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Record<string, unknown>;
        if (typeof d.eventName      === "string") setEventName(d.eventName);
        if (typeof d.eventType      === "string") setEventType(d.eventType);
        if (typeof d.overview       === "string") setOverview(d.overview);
        if (typeof d.tba            === "boolean") setTba(d.tba);
        if (typeof d.eventDate      === "string") setEventDate(d.eventDate);
        if (typeof d.eventTime      === "string") setEventTime(d.eventTime);
        if (typeof d.timezone       === "string") setTimezone(d.timezone);
        if (typeof d.eventEndDate   === "string") setEventEndDate(d.eventEndDate);
        if (typeof d.eventEndTime   === "string") setEventEndTime(d.eventEndTime);
        if (typeof d.regStart       === "string") setRegStart(d.regStart);
        if (typeof d.regStartTime   === "string") setRegStartTime(d.regStartTime);
        if (typeof d.regEnd         === "string") setRegEnd(d.regEnd);
        if (typeof d.regEndTime     === "string") setRegEndTime(d.regEndTime);
        if (d.locationType === "onsite" || d.locationType === "online") setLocationType(d.locationType);
        if (typeof d.locationName    === "string") setLocationName(d.locationName);
        if (typeof d.locationAddress === "string") setLocationAddress(d.locationAddress);
        if (typeof d.city            === "string") setCity(d.city);
        if (typeof d.country         === "string") setCountry(d.country);
        if (typeof d.mapsLink        === "string") setMapsLink(d.mapsLink);
        if (d.seatsType === "limited" || d.seatsType === "unlimited") setSeatsType(d.seatsType);
        if (typeof d.numSeats        === "string") setNumSeats(d.numSeats);
      }
    } catch { /* ignore */ }
    setDraftLoaded(true);
  }, []);

  // ── Persist text fields to localStorage whenever they change ───────────────
  const isFirstSave = useRef(true);
  useEffect(() => {
    if (!draftLoaded) return;
    if (isFirstSave.current) { isFirstSave.current = false; return; }
    try {
      localStorage.setItem(TEXT_KEY, JSON.stringify({
        eventName, eventType, overview, tba,
        eventDate, eventTime, timezone, eventEndDate, eventEndTime,
        regStart, regStartTime, regEnd, regEndTime,
        locationType, locationName, locationAddress, city, country, mapsLink,
        seatsType, numSeats,
      }));
    } catch { /* ignore */ }
  }, [
    draftLoaded, eventName, eventType, overview, tba,
    eventDate, eventTime, timezone, eventEndDate, eventEndTime,
    regStart, regStartTime, regEnd, regEndTime,
    locationType, locationName, locationAddress, city, country, mapsLink,
    seatsType, numSeats,
  ]);

  return (
    <EventCreateContext.Provider value={{
      editId, eventName, setEventName, eventType, setEventType, overview, setOverview,
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
      eligibilitySelected, setEligibilitySelected,
      galleryFiles, setGalleryFiles,
      credentials, setCredentials,
      termsText, setTermsText, termsFile, setTermsFile,
      requireConsent, setRequireConsent,
    }}>
      {children}
    </EventCreateContext.Provider>
  );
}

export function useEventCreate() {
  return useContext(EventCreateContext);
}

/** Call this from the final publish step to clear all persisted draft data. */
export function clearEventDraft() {
  try {
    ["mv_event_create_draft","mv_event_optional_draft","mv_event_credentials_draft",
     "mv_event_participants_draft","mv_event_conditions_draft"].forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
}
