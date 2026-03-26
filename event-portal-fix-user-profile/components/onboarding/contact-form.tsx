"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PhoneCall, Search, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

// Expanded country list to include names for searching
const countriesList = [
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
]

const CONTACT_DRAFT_KEY = "mv_event_portal_welcome_contact_draft"

export function ContactForm() {
    // ─── States ─────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        officialEmail: "",
        countryCode: "+66",
        phoneNumber: "",
    })
    const [hasSubmitted, setHasSubmitted] = useState(false)

    // Custom Country Code Dropdown States
    const [isCountryOpen, setIsCountryOpen] = useState(false)
    const [countrySearch, setCountrySearch] = useState("")
    const countryRef = useRef<HTMLDivElement>(null)
    const [draftReady, setDraftReady] = useState(false)

    const router = useRouter()

    // ─── Effects ────────────────────────────────────────────────────────────
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(CONTACT_DRAFT_KEY)
            if (!raw) return
            const parsed = JSON.parse(raw) as Partial<typeof formData>
            setFormData((prev) => ({
                ...prev,
                ...parsed,
            }))
        } catch {
            // ignore malformed draft
        } finally {
            setDraftReady(true)
        }
    }, [])

    useEffect(() => {
        if (!draftReady) return
        try {
            window.localStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(formData))
        } catch {
            // ignore storage failures
        }
    }, [draftReady, formData])
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
                setIsCountryOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // ─── Handlers & Logic ───────────────────────────────────────────────────

    // Filter countries by name or code
    const filteredCountries = countriesList.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.includes(countrySearch)
    )

    // Email validation using Regex
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail)
    
    // Phone validation (remove spaces/dashes before testing)
    const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, "")
    const isPhoneValid = /^[0-9]{8,15}$/.test(cleanPhone)

    // At least one contact method is required.
    const isEmailFilled = formData.officialEmail.trim() !== ""
    const isPhoneFilled = formData.phoneNumber.trim() !== ""

    const hasAtLeastOneContact = isEmailFilled || isPhoneFilled

    // Only show formatting errors after the user attempts to submit
    const showEmailError = hasSubmitted && isEmailFilled && !isEmailValid
    const showPhoneError = hasSubmitted && isPhoneFilled && !isPhoneValid

    // Final check before proceeding to the next page
    const isFormValid =
        hasAtLeastOneContact &&
        (!isEmailFilled || isEmailValid) &&
        (!isPhoneFilled || isPhoneValid)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setHasSubmitted(true) // Trigger validation display on submit

        if (!isFormValid) return

        console.log("Form submitted:", formData)
        router.push("/welcome/representative")
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Contact Information</span>
                <span className="text-sm text-muted-foreground">Step 3/5</span>
            </div>

            {/* Title */}
            <div className="space-y-2 pb-0">
                <h1
                    className="text-3xl font-medium tracking-tight text-foreground"
                    style={{ fontFamily: "Chillax, sans-serif" }}
                >
                    {"Contact Information"} <span className="inline-block">📞</span>
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">
                    Provide official contact details for your organization
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">

                {/* Official Email */}
                <div className="space-y-2">
                    <Label htmlFor="officialEmail" className="text-base font-medium text-gray-900">
                        Official Email 
                    </Label>
                    <div className="relative">
                        <Input
                            id="officialEmail"
                            type="text" 
                            placeholder="contact@organization.com"
                            value={formData.officialEmail}
                            onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                            className={`h-12 w-full rounded-xl bg-background px-4 !text-sm !placeholder:text-muted-foreground ${
                                showEmailError ? "border-red-500 focus-visible:ring-red-500" : "border-border"
                            }`}
                        />
                    </div>
                    {/* Email Error Message */}
                    {showEmailError && (
                        <p className="text-sm text-red-500 mt-1">
                            Please enter a valid email address.
                        </p>
                    )}
                </div>

                {/* Official Phone Number */}
                <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-base font-medium text-gray-900">
                        Official Phone Number 
                    </Label>
                    <div className="flex gap-3 relative">
                        
                        {/* Custom Searchable Country Code Dropdown */}
                        <div className="relative" ref={countryRef}>
                            <div
                                onClick={() => setIsCountryOpen(!isCountryOpen)}
                                className="h-12 w-[100px] flex items-center justify-between rounded-xl border border-border bg-background px-3 cursor-pointer transition-colors hover:bg-muted/50"
                            >
                                {/* Changed from font-medium to font-normal */}
                                <span className="text-sm font-normal text-foreground">
                                    {formData.countryCode}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
                            </div>

                            {/* Dropdown Menu */}
                            {isCountryOpen && (
                                <div className="absolute top-full left-0 z-50 mt-1.5 w-[260px] rounded-xl border border-border bg-background shadow-lg">
                                    {/* Search Input */}
                                    <div className="flex items-center border-b border-border px-3 py-2.5">
                                        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
                                        <input
                                            type="text"
                                            className="flex flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                            placeholder="Search country"
                                            value={countrySearch}
                                            onChange={(e) => setCountrySearch(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    {/* List Items */}
                                    <div className="max-h-[200px] overflow-y-auto p-1.5">
                                        {filteredCountries.length === 0 ? (
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                No results found.
                                            </div>
                                        ) : (
                                            filteredCountries.map((country) => (
                                                <div
                                                    key={country.name}
                                                    onClick={() => {
                                                        setFormData({ ...formData, countryCode: country.code })
                                                        setIsCountryOpen(false)
                                                        setCountrySearch("") // Reset search when selected
                                                    }}
                                                    className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                                                >
                                                    {/* Changed from font-medium to font-normal */}
                                                    <span className="font-normal text-foreground">{country.name}</span>
                                                    <span className="font-normal text-muted-foreground">{country.code}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Phone Input */}
                        <div className="flex-1">
                            <Input
                                id="phoneNumber"
                                type="tel"
                                placeholder="81 234 5678"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className={`h-12 w-full rounded-xl bg-background px-4 !text-sm !placeholder:text-muted-foreground ${
                                    showPhoneError ? "border-red-500 focus-visible:ring-red-500" : "border-border"
                                }`}
                            />
                        </div>
                    </div>
                    {/* Phone Error Message */}
                    {showPhoneError && (
                        <p className="text-sm text-red-500 mt-1">
                            Please enter a valid phone number (8-15 digits).
                        </p>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-[#F0F7FF] border border-[#3C7ACB] rounded-xl p-4 flex gap-3 items-start">
                    <PhoneCall className="text-[#3C7ACB] w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                        This will be the primary contact method for important updates and notifications about your organization&apos;s events.
                    </p>
                </div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
                <Button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 h-12 rounded-xl bg-background text-foreground border border-border hover:bg-muted font-medium text-base transition-colors"
                >
                    Back
                </Button>
                <Button
                    type="submit"
                    disabled={!hasAtLeastOneContact}
                    className="flex-1 h-12 rounded-xl bg-foreground text-white hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base transition-all"
                >
                    Next
                </Button>
            </div>

        </form>
    )
}