"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getBackendBaseUrl } from "@/shared/config/data-mode"
import { readBackendAccessToken } from "@/shared/auth/backend-access-token.client"

const TERMS_DRAFT_KEY = "mv_event_portal_welcome_terms_draft"
const INFO_DRAFT_KEY = "mv_event_portal_welcome_info_draft"
const VERIFICATION_DRAFT_KEY = "mv_event_portal_welcome_verification_draft"
const CONTACT_DRAFT_KEY = "mv_event_portal_welcome_contact_draft"
const REPRESENTATIVE_DRAFT_KEY = "mv_event_portal_welcome_representative_draft"

export function TermsAndConditionsForm() {
    // ─── States ─────────────────────────────────────────────────────────────
    const [agreed, setAgreed] = useState(false)
    const [subscribe, setSubscribe] = useState(true)
    const [termsText, setTermsText] = useState("")
    const [policyText, setPolicyText] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // State to track if the user has scrolled to the bottom of the terms
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [draftReady, setDraftReady] = useState(false)
    
    const router = useRouter()

    // ─── Effects ────────────────────────────────────────────────────────────
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(TERMS_DRAFT_KEY)
            if (!raw) return
            const parsed = JSON.parse(raw) as { agreed?: boolean; subscribe?: boolean }
            if (typeof parsed.agreed === "boolean") setAgreed(parsed.agreed)
            if (typeof parsed.subscribe === "boolean") setSubscribe(parsed.subscribe)
        } catch {
            // ignore malformed draft
        } finally {
            setDraftReady(true)
        }
    }, [])

    useEffect(() => {
        if (!draftReady) return
        try {
            window.localStorage.setItem(
                TERMS_DRAFT_KEY,
                JSON.stringify({ agreed, subscribe }),
            )
        } catch {
            // ignore storage failures
        }
    }, [agreed, draftReady, subscribe])

    useEffect(() => {
        const fetchLegalDocuments = async () => {
            setIsLoading(true)
            setError(null)
            
            try {
                const [termsResponse, policyResponse] = await Promise.all([
                    fetch("/org/assets/legal/terms-en.txt"),
                    fetch("/org/assets/legal/policy-en.txt")
                ])

                if (!termsResponse.ok || !policyResponse.ok) {
                    throw new Error("Failed to load documents")
                }

                const terms = await termsResponse.text()
                const policy = await policyResponse.text()

                setTermsText(terms)
                setPolicyText(policy)
            } catch (err) {
                setError("Unable to load legal documents. Please try again later.")
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchLegalDocuments()
    }, [])

    // Check if the content is short enough that scrolling isn't required after loading
    useEffect(() => {
        if (!isLoading && scrollRef.current) {
            const { scrollHeight, clientHeight } = scrollRef.current;
            if (scrollHeight <= clientHeight) {
                setHasScrolledToBottom(true);
            }
        }
    }, [isLoading, termsText, policyText])

    // ─── Handlers ───────────────────────────────────────────────────────────
    const handleScroll = () => {
        if (!scrollRef.current || hasScrolledToBottom) return;
        
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        // Allow a 2px margin of error to ensure it registers as reaching the bottom
        if (scrollTop + clientHeight >= scrollHeight - 2) {
            setHasScrolledToBottom(true);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!agreed || !subscribe || isSubmitting) return

        const parseDraft = (key: string) => {
            try {
                const raw = window.localStorage.getItem(key)
                if (!raw) return {}
                const parsed = JSON.parse(raw)
                if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
                return parsed as Record<string, unknown>
            } catch {
                return {}
            }
        }

        const info = parseDraft(INFO_DRAFT_KEY)
        const verification = parseDraft(VERIFICATION_DRAFT_KEY)
        const contact = parseDraft(CONTACT_DRAFT_KEY)
        const representative = parseDraft(REPRESENTATIVE_DRAFT_KEY)

        const payload = {
            org_name: typeof info.organizationName === "string" ? info.organizationName : "",
            abbreviation: typeof info.abbreviation === "string" ? info.abbreviation : "",
            org_type: typeof info.organizationType === "string" ? info.organizationType : "",
            custom_org_type: typeof info.customOrgType === "string" ? info.customOrgType : "",
            country: typeof info.Country === "string" ? info.Country : "",
            city: typeof info.City === "string" ? info.City : "",
            website: typeof verification.website === "string" ? verification.website : "",
            social_media: typeof verification.socialMedia === "string" ? verification.socialMedia : "",
            other_urls: typeof verification.otherUrls === "string" ? verification.otherUrls : "",
            official_email: typeof contact.officialEmail === "string" ? contact.officialEmail : "",
            official_country_code: typeof contact.countryCode === "string" ? contact.countryCode : "",
            official_phone_number: typeof contact.phoneNumber === "string" ? contact.phoneNumber : "",
            representative_name:
                typeof representative.representativeName === "string" ? representative.representativeName : "",
            representative_role:
                typeof representative.representativeRole === "string" ? representative.representativeRole : "",
            representative_email: typeof representative.email === "string" ? representative.email : "",
            representative_country_code:
                typeof representative.countryCode === "string" ? representative.countryCode : "",
            representative_phone_number:
                typeof representative.phoneNumber === "string" ? representative.phoneNumber : "",
            agreed_to_terms: agreed,
            subscribed_to_updates: subscribe,
        }

        setIsSubmitting(true)
        const backendToken = readBackendAccessToken();
        fetch(`${getBackendBaseUrl()}/api/v1/organizations/onboarding-submissions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(backendToken ? { Authorization: `Bearer ${backendToken}` } : {}),
            },
            body: JSON.stringify(payload),
        })
            .then(async (response) => {
                if (!response.ok) {
                    const body = await response.json().catch(() => ({}))
                    throw new Error(
                        (body && typeof body.error === "string" && body.error) ||
                            "Failed to save onboarding details.",
                    )
                }

                window.localStorage.removeItem(INFO_DRAFT_KEY)
                window.localStorage.removeItem(VERIFICATION_DRAFT_KEY)
                window.localStorage.removeItem(CONTACT_DRAFT_KEY)
                window.localStorage.removeItem(REPRESENTATIVE_DRAFT_KEY)
                window.localStorage.removeItem(TERMS_DRAFT_KEY)
                router.push("/events")
            })
            .catch((submitErr) => {
                const message = submitErr instanceof Error ? submitErr.message : "Failed to save onboarding details."
                setError(message)
            })
            .finally(() => {
                setIsSubmitting(false)
            })
    }

    return (
        <div className="w-full max-w-md space-y-6"> 
            
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Terms & Conditions</span>
                <span className="text-sm text-muted-foreground">Step 5/5</span>
            </div>

            {/* Title */}
            <div className="space-y-2 pb-0">
                <h1
                    className="text-3xl font-medium tracking-tight text-foreground"
                    style={{ fontFamily: "Chillax, sans-serif" }}
                >
                    {"Almost There!"} <span className="inline-block">✨</span>
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">
                    Review and accept our policies to get started.
                </p>
            </div>
            
            {/* Form  */}
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 border border-gray-100 rounded-3xl shadow-sm space-y-6 relative z-10">

                {/* Scrollable Terms Box */}
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="border border-gray-200 rounded-2xl px-6 pt-6 h-[320px] overflow-y-auto bg-gray-50 relative"
                >
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                            Loading documents...
                        </div>
                    ) : error ? (
                        <div className="flex h-full items-center justify-center text-sm text-red-500">
                            {error}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <h2 className="text-[17px] font-semibold text-gray-900 sticky bg-gray-50 py-1">
                                    Terms of Service
                                </h2>
                                <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {termsText}
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-gray-200">
                                <h2 className="text-[17px] font-semibold text-gray-900 sticky bg-gray-50 py-1">
                                    Privacy Policy
                                </h2>
                                <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {policyText}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Checkbox Section */}
                <div className="space-y-4">
                    {/* Required Terms Checkbox */}
                    <label className={`flex items-start gap-4 ${!hasScrolledToBottom ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={agreed}
                                disabled={!hasScrolledToBottom}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <div className={`w-6 h-6 rounded-md border-2 transition-colors flex items-center justify-center ${
                                !hasScrolledToBottom 
                                ? "border-gray-200 bg-gray-100" 
                                : "border-gray-300 peer-checked:border-black peer-checked:bg-black"
                            }`}>
                                {agreed && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="text-base font-medium text-gray-900 leading-snug">
                            I have read and agree to the Terms of Service and Privacy Policy
                            {/* {!hasScrolledToBottom && (
                                <span className="block text-xs text-red-500 mt-1">
                                    Please scroll to the bottom to agree.
                                </span>
                            )} */}
                        </span>
                    </label>

                    {/* Optional Newsletter Checkbox */}
                    <label className="flex items-start gap-4 cursor-pointer">
                        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={subscribe}
                                onChange={(e) => setSubscribe(e.target.checked)}
                            />
                            <div className="w-6 h-6 rounded-md border-2 border-gray-300 peer-checked:border-black peer-checked:bg-black transition-colors flex items-center justify-center">
                                {subscribe && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="text-base font-medium text-gray-900 leading-snug">
                            I would like to receive news, updates, and promotional emails
                        </span>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2">
                    <Button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 h-12 rounded-xl bg-background text-foreground border border-border hover:bg-muted font-medium text-base transition-colors"
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        disabled={!agreed || !subscribe || isLoading || !!error || isSubmitting}
                        className="flex-1 h-12 rounded-xl bg-foreground text-white hover:bg-foreground/90 disabled:opacity-50 font-medium text-base transition-colors"
                    >
                        {isSubmitting ? "Saving..." : "Done"}
                    </Button>
                </div>

            </form>
        </div> 
    )
}