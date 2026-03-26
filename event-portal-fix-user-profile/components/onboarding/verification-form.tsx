"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FileText, Globe } from "lucide-react"
import { useRouter } from "next/navigation"

const VERIFICATION_DRAFT_KEY = "mv_event_portal_welcome_verification_draft"

export function VerificationForm() {
    // ─── States ─────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        otherUrls: "",
        socialMedia: "",
        website: "",
    })

    const [certFile, setCertFile] = useState<File | null>(null)
    const certRef = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null) // State for image preview
    const [draftReady, setDraftReady] = useState(false)

    const router = useRouter()

    // ─── Effects ────────────────────────────────────────────────────────────
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(VERIFICATION_DRAFT_KEY)
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
            window.localStorage.setItem(VERIFICATION_DRAFT_KEY, JSON.stringify(formData))
        } catch {
            // ignore storage failures
        }
    }, [draftReady, formData])

    // Clean up the object URL to avoid memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleCert = (file: File) => {
        setCertFile(file)
        // Generate preview URL for image files
        if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        } else {
            setPreviewUrl(null) // Clear preview for non-image files
        }
    }

    // ─── Validation ─────────────────────────────────────────────────────────

    // At least one proof input is required.
    const isFormValid = certFile !== null || [formData.website, formData.socialMedia, formData.otherUrls].some((value) => /\S/.test(value))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormValid) return // Prevent submission if invalid

        console.log("Form submitted:", formData)
        console.log("Uploaded Certificate:", certFile)
        router.push("/welcome/contact")
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Verification</span>
                <span className="text-sm text-muted-foreground">Step 2/5</span>
            </div>

            {/* Title */}
            <div className="space-y-2 pb-0">
                <h1
                    className="text-3xl font-medium tracking-tight text-foreground"
                    style={{ fontFamily: "Chillax, sans-serif" }}
                >
                    {"Verification Details"} <span className="inline-block">📄</span>
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">
                    Help us verify your organization&apos;s authenticity
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">

                {/* Upload Logo with Circular Preview */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Verification Documents
                    </Label>
                    <Label className="text-sm font-normal text-muted-foreground">
                        Upload official documents to verify your organization(business registration, certificate, etc.)
                    </Label>
                    <div
                        onClick={() => certRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const f = e.dataTransfer.files?.[0];
                            if (f) handleCert(f);
                        }}
                        className="border-2 border-dashed border-[#3C7ACB]/40 rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50/30 transition min-h-[120px]"
                    >
                        {/* Display circular image preview if it exists */}
                        {previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewUrl}
                                alt="Profile Preview"
                                className="w-16 h-16 rounded-full object-cover border border-border shadow-sm mb-1"
                            />
                        ) : (
                            <FileText size={24} className="text-gray-400" />
                        )}

                        <p className="text-sm font-medium text-gray-600 text-center">
                            {certFile ? "Click or drag to replace Document" : "Upload Document"}
                        </p>
                        <p className="text-xs text-gray-400">PDF, DOC, JPG up to 10MB each</p>

                        {/* Fallback text if a non-image file (like PDF) is uploaded */}
                        {certFile && !previewUrl && (
                            <p className="text-xs font-medium text-green-600 mt-1">
                                ✓ {certFile.name} uploaded
                            </p>
                        )}
                    </div>

                    <input
                        ref={certRef}
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleCert(f);
                        }}
                    />
                </div>

                {/* Official Website */}
                <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">
                        Official Website
                    </Label>
                    <div className="relative">
                        <Globe
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <Input
                            id="website"
                            type="text"
                            placeholder="https://www.yourorg.com"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="h-12 rounded-lg border-border bg-background pl-11 pr-4 !text-sm !placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                {/* Social Media */}
                <div className="space-y-2">
                    <Label htmlFor="socialMedia" className="text-sm font-medium">
                        Social Media
                    </Label>
                    <div className="relative">
                        <Input
                            id="socialMedia"
                            type="text"
                            placeholder="LinkedIn, Twitter, etc."
                            value={formData.socialMedia}
                            onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                            className="h-12 rounded-lg border-border bg-background px-4 !text-sm !placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                {/* Other URLs */}
                <div className="space-y-2">
                    <Label htmlFor="otherUrls" className="text-sm font-medium">
                        Other URLs
                    </Label>
                    <div className="relative">
                        <textarea
                            id="otherUrls"
                            value={formData.otherUrls}
                            placeholder={"Other links to verify your organization.\n(Please enter one link per line)"} onChange={(e) => setFormData({ ...formData, otherUrls: e.target.value })}
                            className="min-h-[120px] w-full rounded-lg border border-border bg-background px-4 pt-3 !text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C7ACB]/20 focus-visible:border-[#3C7ACB] transition-all resize-y"
                        />
                    </div>
                </div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-0">
                <Button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 h-12 rounded-xl bg-background text-foreground border border-border hover:bg-muted font-medium text-base transition-colors"
                >
                    Back
                </Button>
                <Button
                    type="submit"
                    disabled={!isFormValid} // Disable if form is incomplete
                    className="flex-1 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base transition-colors"
                >
                    Next
                </Button>
            </div>
        </form>
    )
}