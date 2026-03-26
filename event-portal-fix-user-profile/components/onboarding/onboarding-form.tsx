"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, Search, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

const orgTypesList = [
  "Company",
  "School",
  "University",
  "Training Provider",
  "NGO",
  "Student Organization",
  "Other"
]

const INFO_DRAFT_KEY = "mv_event_portal_welcome_info_draft"

export function OnboardingForm() {
  // ─── States ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    organizationName: "",
    abbreviation: "",
    Country: "",
    City: "",
    organizationType: "",
    customOrgType: "", // State for "Other" organization type input
  })

  const [certFile, setCertFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null) // State for image preview
  const certRef = useRef<HTMLInputElement>(null)

  // Custom Organization Type Dropdown States
  const [isOrgTypeOpen, setIsOrgTypeOpen] = useState(false)
  const [orgTypeSearch, setOrgTypeSearch] = useState("")
  const orgTypeRef = useRef<HTMLDivElement>(null)
  const [draftReady, setDraftReady] = useState(false)

  const router = useRouter()

  // ─── Effects ────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(INFO_DRAFT_KEY)
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
      window.localStorage.setItem(INFO_DRAFT_KEY, JSON.stringify(formData))
    } catch {
      // ignore storage failures
    }
  }, [draftReady, formData])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (orgTypeRef.current && !orgTypeRef.current.contains(event.target as Node)) {
        setIsOrgTypeOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
    
    // Check if the file is an image to create a preview
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      // If it's a PDF, we don't preview it as an image
      setPreviewUrl(null)
    }
  }

  const filteredOrgTypes = orgTypesList.filter((type) =>
    type.toLowerCase().includes(orgTypeSearch.toLowerCase())
  )

  // ─── Validation ─────────────────────────────────────────────────────────
  
  // Check if organization type is valid
  const isOrgTypeValid = formData.organizationType !== "" && 
    (formData.organizationType !== "Other" || formData.customOrgType.trim() !== "")

  // Check if all required fields are filled
  const isFormValid =
    isOrgTypeValid &&
    certFile !== null &&
    formData.organizationName.trim() !== "" &&
    formData.abbreviation.trim() !== "" &&
    formData.Country.trim() !== "" &&
    formData.City.trim() !== ""

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return // Prevent submission if invalid
    
    // If "Other" is selected, use the custom organization type instead
    const finalData = {
      ...formData,
      finalOrganizationType: formData.organizationType === "Other" ? formData.customOrgType : formData.organizationType
    }

    console.log("Form submitted:", finalData)
    console.log("Uploaded Certificate:", certFile)
    router.push("/welcome/verification")
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Organization Info</span>
        <span className="text-sm text-muted-foreground">Step 1/5</span>
      </div>

      {/* Title */}
      <div className="space-y-2 pb-0">
        <h1
          className="text-3xl font-medium tracking-tight text-foreground"
          style={{ fontFamily: "Chillax, sans-serif" }}
        >
          {"Let's get to know you"} <span className="inline-block">👋</span>
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Tell us about your organization so we can personalize your experience.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">

        {/* Custom Searchable Organization Type Dropdown */}
        <div className="space-y-2" ref={orgTypeRef}>
          <Label className="text-sm font-medium">Organization Type</Label>
          <div className="relative">
            <div
              onClick={() => setIsOrgTypeOpen(!isOrgTypeOpen)}
              className="h-12 w-full flex items-center justify-between rounded-lg border border-border bg-background px-4 cursor-pointer transition-colors hover:bg-muted/50"
            >
              <span className={`text-sm truncate ${formData.organizationType ? "text-foreground" : "text-muted-foreground"}`}>
                {formData.organizationType || "Select organization type"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
            </div>

            {/* Dropdown Menu */}
            {isOrgTypeOpen && (
              <div className="absolute z-50 mt-1.5 w-full rounded-lg border border-border bg-background shadow-lg">
                {/* Search Input */}
                <div className="flex items-center border-b border-border px-3 py-2.5">
                  <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
                  <input
                    type="text"
                    className="flex flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Search organization type"
                    value={orgTypeSearch}
                    onChange={(e) => setOrgTypeSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                {/* List Items */}
                <div className="max-h-[200px] overflow-y-auto p-1.5">
                  {filteredOrgTypes.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No results found.
                    </div>
                  ) : (
                    filteredOrgTypes.map((type) => (
                      <div
                        key={type}
                        onClick={() => {
                          setFormData({ ...formData, organizationType: type })
                          setIsOrgTypeOpen(false)
                          setOrgTypeSearch("") // Reset search when selected
                        }}
                        className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <span className="font-medium text-foreground">{type}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conditional Input for "Other" Organization Type */}
        {formData.organizationType === "Other" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Label htmlFor="customOrgType" className="text-sm font-medium">
              Please specify 
            </Label>
            <Input
              id="customOrgType"
              type="text"
              placeholder="e.g. Government Agency, Non-profit"
              value={formData.customOrgType}
              onChange={(e) => setFormData({ ...formData, customOrgType: e.target.value })}
              className="h-12 rounded-lg border-border bg-background px-4 !text-sm !placeholder:text-muted-foreground"
            />
          </div>
        )}

        {/* Organization Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Organization Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter organization name"
            value={formData.organizationName}
            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
            className="h-12 rounded-lg border-border bg-background px-4 !text-sm !placeholder:text-muted-foreground"
          />
        </div>

        {/* Abbreviation Name */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Abbreviation Name
          </Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              placeholder="e.g. MIT, IBM, WWF"
              value={formData.abbreviation}
              onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
              className="h-12 rounded-lg border-border bg-background pl-4 pr-4 !text-sm !placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Upload Logo with Circular Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Organization Profile Image
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
              <Upload size={24} className="text-gray-400" />
            )}

            <p className="text-sm font-medium text-gray-600 text-center">
              {certFile ? "Click or drag to replace Logo" : "Upload Logo/Image"}
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>

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

        {/* Country & City */}
        <div className="flex">
          <div className="space-y-2 mr-4 w-1/2">
            <Label htmlFor="Country" className="text-sm font-medium">
              Country
            </Label>
            <div className="relative">
              <Input
                id="Country"
                type="text"
                placeholder="Country"
                value={formData.Country}
                onChange={(e) => setFormData({ ...formData, Country: e.target.value })}
                className="h-12 w-full rounded-lg border-border bg-background pl-4 pr-4 !text-sm !placeholder:text-muted-foreground"
              />
            </div>
          </div>
          
          <div className="space-y-2 w-1/2">
            <Label htmlFor="City" className="text-sm font-medium">
              City
            </Label>
            <div className="relative">
              <Input
                id="City"
                type="text"
                placeholder="City"
                value={formData.City}
                onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                className="h-12 w-full rounded-lg border-border bg-background pl-4 pr-4 !text-sm !placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isFormValid} // Disable if form is incomplete
        className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base mt-1 transition-all"
        style={{ fontFamily: "Chillax, sans-serif" }}
      >
        Next
      </Button>
    </form>
  )
}