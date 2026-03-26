"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Contact2, Search, ChevronDown } from "lucide-react" 
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

const REPRESENTATIVE_DRAFT_KEY = "mv_event_portal_welcome_representative_draft"

export function RepresentativeForm() { 
    // ─── States ─────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        representativeName: "",
        representativeRole: "",
        countryCode: "+66",
        phoneNumber: "",
        email: "",
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
            const raw = window.localStorage.getItem(REPRESENTATIVE_DRAFT_KEY)
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
            window.localStorage.setItem(REPRESENTATIVE_DRAFT_KEY, JSON.stringify(formData))
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

    // Phone validation (remove spaces/dashes before testing)
    const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, "")
    const isPhoneValid = /^[0-9]{8,15}$/.test(cleanPhone) 

    // Email validation using Regex
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    
    // Check if required fields have at least some input to enable the button
    const isNameFilled = formData.representativeName.trim() !== ""
    const isRoleFilled = formData.representativeRole.trim() !== ""
    const isPhoneFilled = formData.phoneNumber.trim() !== ""
    const isEmailFilled = formData.email.trim() !== ""
    
    const isAllRequiredFilled = isNameFilled && isRoleFilled && isPhoneFilled && isEmailFilled

    // Only show formatting errors after the user attempts to submit
    const showPhoneError = hasSubmitted && !isPhoneValid
    const showEmailError = hasSubmitted && !isEmailValid
    const showNameError = hasSubmitted && !isNameFilled
    const showRoleError = hasSubmitted && !isRoleFilled

    // Final check before proceeding to the next page
    const isFormValid = isNameFilled && isRoleFilled && isPhoneValid && isEmailValid

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setHasSubmitted(true) // Trigger validation display on submit

        if (!isFormValid) return

        console.log("Form submitted:", formData)
        router.push("/welcome/terms") 
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Representative Information</span>
                <span className="text-sm text-muted-foreground">Step 4/5</span>
            </div>

            {/* Title */}
            <div className="space-y-2 pb-0">
                <h1
                    className="text-3xl font-medium tracking-tight text-foreground"
                    style={{ fontFamily: "Chillax, sans-serif" }}
                >
                    {"Representative Details"} <span className="inline-block">👤</span>
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">
                   Who will be the main contact person?
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">

                {/* Representative Name */}
                <div className="space-y-2">
                    <Label htmlFor="representativeName" className="text-base font-medium text-gray-900">
                        Representative Name 
                    </Label>
                    <Input
                        id="representativeName"
                        type="text"
                        placeholder="Full name"
                        value={formData.representativeName}
                        onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                        className={`h-12 rounded-xl bg-background px-4 !text-sm !placeholder:text-muted-foreground ${
                            showNameError ? "border-red-500 focus-visible:ring-red-500" : "border-border"
                        }`}
                    />
                    {showNameError && (
                        <p className="text-sm text-red-500 mt-1">Please enter the representative name.</p>
                    )}
                </div>

                {/* Representative Role */}
                <div className="space-y-2">
                    <Label htmlFor="representativeRole" className="text-base font-medium text-gray-900">
                        Representative Role 
                    </Label>
                    <Input
                        id="representativeRole"
                        type="text"
                        placeholder="e.g., Director, Manager, Coordinator"
                        value={formData.representativeRole}
                        onChange={(e) => setFormData({ ...formData, representativeRole: e.target.value })}
                        className={`h-12 rounded-xl bg-background px-4 !text-sm !placeholder:text-muted-foreground ${
                            showRoleError ? "border-red-500 focus-visible:ring-red-500" : "border-border"
                        }`}
                    />
                    {showRoleError && (
                        <p className="text-sm text-red-500 mt-1">Please enter the representative role.</p>
                    )}
                </div>

                {/* Official Email */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium text-gray-900">
                         Email 
                    </Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="text"
                            placeholder="contact@organization.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

                {/* Representative Phone Number */}
                <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-base font-medium text-gray-900">
                        Representative Phone Number 
                    </Label>
                    <div className="flex gap-3 relative">
                        
                        {/* Custom Searchable Country Code Dropdown */}
                        <div className="relative" ref={countryRef}>
                            <div
                                onClick={() => setIsCountryOpen(!isCountryOpen)}
                                className="h-12 w-[100px] flex items-center justify-between rounded-xl border border-border bg-background px-3 cursor-pointer transition-colors hover:bg-muted/50"
                            >
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
                    <Contact2 className="text-[#3C7ACB] w-6 h-6 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                        The representative will be the main point of contact for managing events and credentials.
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
                    disabled={!isAllRequiredFilled}
                    className="flex-1 h-12 rounded-xl bg-foreground text-white hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base transition-all"
                >
                    Next
                </Button>
            </div>

        </form>
    )
}