"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import QuestionCard, { formBuilderSchema, FormBuilderValues } from "@/components/QuestionCard";
import { getBackendBaseUrl } from "@/shared/config/data-mode";
import { useEventCreate, clearEventDraft } from "../EventCreateContext";

function parseDateTime(date: string, time12: string) {
    if (!date) return null;
    if (!time12) return new Date(`${date}T00:00:00`);
    const m = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let hour = Number(m[1]);
    const minute = Number(m[2]);
    const period = m[3].toUpperCase();
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`);
}

export default function CreateParticipantsPage() {
    const router = useRouter();
    const ctx = useEventCreate();

    const [publishError, setPublishError] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const PARTICIPANTS_DRAFT_KEY = "mv_event_participants_draft";

    const { register, control, handleSubmit, watch, reset } = useForm<FormBuilderValues>({
        resolver: zodResolver(formBuilderSchema),
        defaultValues: {
            formTitle: "Event Registration Form",
            formDescription: "Please fill out the following information to complete your registration.",
            questions: [],
        },
    });
    const [draftReady, setDraftReady] = useState(false);
    const watchedValues = watch();

    const { fields, append, remove, insert } = useFieldArray({ control, name: "questions" });

    const onSubmit = async (formData: FormBuilderValues) => {
        setPublishError(null);
        setIsPublishing(true);
        try {
            // ── Build event payload from context (all pages' data is available) ──
            const {
                eventName, overview, tba,
                eventDate, eventTime, eventEndDate, eventEndTime,
                seatsType, numSeats,
                locationType, locationName, locationAddress, city, country, mapsLink,
                days, outcomes, speakers, eligibilitySelected,
                credentials, termsText, requireConsent,
                regStart, regStartTime, regEnd, regEndTime,
                timezone, eventType,
            } = ctx;

            if (!eventName.trim()) {
                setPublishError("Please complete event details in previous steps.");
                return;
            }

            const startAt = tba ? null : parseDateTime(eventDate, eventTime);
            const endAt = tba ? null : parseDateTime(eventEndDate || eventDate, eventEndTime || eventTime);
            const regStartAt = parseDateTime(regStart, regStartTime);
            const regEndAt = parseDateTime(regEnd, regEndTime);

            if (!tba && (!startAt || !endAt || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()))) {
                setPublishError("Please complete event start/end dates in previous steps.");
                return;
            }

            const sessionRes = await fetch("/org/api/auth/session", { cache: "no-store" });
            const sessionPayload = await sessionRes.json().catch(() => null);
            const createdBy = sessionPayload?.data?.user?.id;

            const capacity =
                seatsType === "unlimited" ? 0
                    : Number.isFinite(Number(numSeats)) && Number(numSeats) > 0 ? Number(numSeats)
                        : 100;

            // ── Full payload — includes all collected data ──────────────────────
            const payload = {
                // Core event
                name: eventName,
                short_description: overview ? overview.slice(0, 160) : "Event",
                description: overview,
                event_type: eventType,
                start_at: startAt?.toISOString() ?? null,
                end_at: endAt?.toISOString() ?? null,
                is_tba: tba,
                timezone,
                capacity,
                status: "pending",
                created_by: typeof createdBy === "string" ? createdBy : undefined,

                // Registration window
                registration_start_at: regStartAt?.toISOString() ?? null,
                registration_end_at: regEndAt?.toISOString() ?? null,

                // Agenda
                agenda: days.map(day => ({
                    date: day.date,
                    slots: day.slots.map(s => ({ time: s.time, activity: s.activity })),
                })),

                // Location
                location: {
                    type: locationType,
                    name: locationName,
                    address: locationAddress,
                    city,
                    country,
                    maps_link: mapsLink,
                },

                // Outcomes
                outcomes: outcomes.map(o => ({ title: o.title, description: o.description })),

                // Speakers (text data; photos require a separate upload endpoint)
                speakers: speakers.map(s => ({ name: s.name, position: s.position, bio: s.bio })),

                // Eligibility
                eligibility: eligibilitySelected,

                // Credentials (text data; logo/cert files require a separate upload endpoint)
                credentials: credentials.map(c => ({
                    award_name: c.awardName,
                    color: c.color,
                    issued_date: c.issuedDate,
                    rank: c.rank,
                    distribution: c.distribution,
                    num_participants: c.distribution === "specific" ? Number(c.numParticipants) : null,
                    requirements: c.requirements,
                    name_box: c.nameBox,
                })),

                // Registration form
                registration_form: {
                    title: formData.formTitle,
                    description: formData.formDescription,
                    questions: formData.questions,
                },

                // Terms
                terms: {
                    text: termsText,
                    require_consent: requireConsent,
                },
            };

            const response = await fetch(`${getBackendBaseUrl()}/api/v1/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const body = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(body && typeof body.error === "string" ? body.error : "Failed to publish event.");
            }

            // ── If images need to be uploaded, do it here with the returned event id ──
            // const eventId = body.data?.id;
            // if (eventId) {
            //   const fd = new FormData();
            //   if (ctx.smallBanner) fd.append("small_banner", ctx.smallBanner);
            //   if (ctx.largeBanner) fd.append("large_banner", ctx.largeBanner);
            //   await fetch(`${getBackendBaseUrl()}/api/v1/events/${eventId}/images`, { method: "POST", body: fd });
            // }

            clearEventDraft();
            router.push("/events");
        } catch (err) {
            setPublishError(err instanceof Error ? err.message : "Failed to publish event.");
        } finally {
            setIsPublishing(false);
        }
    };

    const onInvalid = () => {
        setPublishError("Please complete all required fields before publishing (question title is required).");
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem(PARTICIPANTS_DRAFT_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as FormBuilderValues;
            if (parsed && typeof parsed === "object") reset(parsed);
        } catch { /* ignore */ }
        finally { setDraftReady(true); }
    }, [reset]);

    useEffect(() => {
        if (!draftReady) return;
        try { localStorage.setItem(PARTICIPANTS_DRAFT_KEY, JSON.stringify(watchedValues)); }
        catch { /* ignore */ }
    }, [draftReady, watchedValues]);

    return (
        <DashboardLayout>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm mx-3 mt-2 rounded-2xl shadow-sm">
                    <Link href="/events/new/credentials" className="text-gray-500 hover:text-gray-700 transition"><ArrowLeft size={20} /></Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "Chillax, sans-serif" }}>Registration Form Builder</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Customize the form to collect information from event participants</p>
                    </div>
                </div>

                <div className="px-8 py-6 flex flex-col gap-5 flex-1">
                    <div className="w-full mx-auto flex flex-col gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-t-[10px] border-t-[#3C7ACB] px-8 py-8 relative">
                            <input {...register("formTitle")}
                                className="w-full text-[32px] leading-tight text-gray-900 mb-2 border-b border-transparent hover:border-gray-200 focus:border-[#3C7ACB] focus:outline-none pb-1 transition-colors" />
                            <input {...register("formDescription")}
                                className="w-full text-[15px] text-gray-600 mt-2 border-b border-transparent hover:border-gray-200 focus:border-[#3C7ACB] focus:outline-none pb-1 transition-colors" />
                        </div>

                        {fields.map((field, index) => (
                            <QuestionCard key={field.id} index={index} control={control}
                                register={register} remove={remove} insert={insert} currentField={field} />
                        ))}

                        <div className="flex justify-center mt-4">
                            <button type="button"
                                onClick={() => append({ title: "", type: "short", required: false, options: [{ value: "Option 1" }] })}
                                className="flex items-center gap-2 bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-full text-gray-700 hover:bg-gray-50 transition-colors">
                                <Plus size={18} />
                                <span className="text-sm font-medium">Add Question</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 pb-6 mt-4 border-t border-gray-100">
                        <Link href="/events/new/credentials" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Back</Link>
                        <div className="flex items-center gap-3">
                            {publishError && <p className="text-sm text-red-600">{publishError}</p>}
                            <button type="submit" disabled={isPublishing}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-[#3C7ACB] rounded-lg hover:opacity-90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                                {isPublishing ? "Publishing…" : fields.length === 0 ? "Skip & Publish Event" : "Publish Event"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
