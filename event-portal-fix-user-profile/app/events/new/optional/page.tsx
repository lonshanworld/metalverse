"use client";

import { useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, X, ImageIcon } from "lucide-react";
import { useEventCreate, GalleryFile } from "../EventCreateContext";

const PRESET_GROUPS = [
  "Primary School Students", "Middle School Students", "High School Students",
  "Undergraduate Students", "Graduate Students", "Early-career Professionals",
];

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-7">{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: "Chillax, sans-serif" }}>{children}</h2>;
}

export default function OptionalInfoPage() {
  const { eligibilitySelected, setEligibilitySelected, galleryFiles, setGalleryFiles } = useEventCreate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(Date.now());

  const toggleGroup = (group: string) =>
    setEligibilitySelected(
      eligibilitySelected.includes(group)
        ? eligibilitySelected.filter(g => g !== group)
        : [...eligibilitySelected, group]
    );

  const removeSelected = (group: string) => setEligibilitySelected(eligibilitySelected.filter(g => g !== group));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setGalleryFiles(prev => {
      const remaining = 5 - prev.length;
      if (remaining <= 0) return prev;
      const toAdd: GalleryFile[] = Array.from(files).slice(0, remaining).map(file => ({
        id: nextId.current++, file, preview: URL.createObjectURL(file),
      }));
      return [...prev, ...toAdd];
    });
  };

  const removeFile = (id: number) => setGalleryFiles(prev => prev.filter(f => f.id !== id));

  const hasInput = eligibilitySelected.length > 0 || galleryFiles.length > 0;

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm mx-3 mt-2 rounded-2xl shadow-sm">
        <Link href="/events/new" className="text-gray-500 hover:text-gray-700 transition"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "Chillax, sans-serif" }}>Optional Information</h1>
          <p className="text-sm text-gray-500 mt-0.5">Add additional details to enhance your event listing</p>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-5">

        <SectionCard>
          <SectionTitle>Eligibility</SectionTitle>
          <p className="text-sm text-gray-400 mb-5">Select who can join this event. Leave blank if it&apos;s open to everyone.</p>
          <p className="text-sm font-semibold text-gray-700 mb-3">Select Eligibility</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {PRESET_GROUPS.map(group => {
              const isActive = eligibilitySelected.includes(group);
              return (
                <button key={group} type="button" onClick={() => toggleGroup(group)}
                  className={`px-3.5 py-1.5 rounded-lg border text-sm font-medium transition ${isActive ? "border-[#3C7ACB] bg-[#EEF5FC] text-[#3C7ACB]" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
                  {group}
                </button>
              );
            })}
          </div>
          {eligibilitySelected.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Selected Eligibility Groups</p>
              <div className="flex flex-wrap gap-2">
                {eligibilitySelected.map(group => (
                  <span key={group} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#3C7ACB] bg-[#EEF5FC] text-sm text-[#3C7ACB] font-medium">
                    {group}
                    <button type="button" onClick={() => removeSelected(group)} className="text-[#3C7ACB] hover:opacity-60 transition ml-0.5"><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <div className="flex items-center justify-between -mb-1">
            <SectionTitle>Gallery</SectionTitle>
            <span className="text-xs text-gray-400">{galleryFiles.length}/5</span>
          </div>
          <p className="text-sm text-gray-400 mb-5">Upload additional images or videos that showcase your event, venue, or past activities.</p>
          <div onClick={() => fileInputRef.current?.click()} onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            className="border border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition mb-4">
            <ImageIcon size={36} className="text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, GIF, MP4 up to 10MB</p>
            </div>
            <button type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="mt-1 px-5 py-2 bg-[#3C7ACB] hover:opacity-90 text-white text-sm font-medium rounded-lg transition">
              Select Files
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif,video/mp4" multiple className="hidden"
            onChange={e => handleFiles(e.target.files)} />
          {galleryFiles.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-5">
              {galleryFiles.map(gf => (
                <div key={gf.id} className="relative group rounded-lg overflow-hidden border border-gray-100 aspect-square bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gf.preview} alt={gf.file.name} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeFile(gf.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
            <p className="text-sm font-semibold text-amber-700 mb-2">Important Guidelines</p>
            <ul className="space-y-1">
              {["Please ensure all images and videos are your own original content or properly licensed",
                "Do not upload content from external platforms that includes watermarks, branding, or copyrighted material",
                "Avoid images with embedded URLs, website addresses, or promotional text from third-party sources",
                "All content should be appropriate and relevant to your event"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />{item}
                  </li>
                ))}
            </ul>
          </div>
        </SectionCard>

        <div className="flex items-center justify-between pb-6">
          <Link href="/events/new" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Back</Link>
          <div className="flex items-center gap-3">
            {!hasInput
              ? <Link href="/events/new/credentials" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Skip</Link>
              : <Link href="/events/new/credentials" className="px-6 py-2.5 text-sm font-medium text-white bg-[#3C7ACB] rounded-lg hover:opacity-90 transition shadow-sm">Next</Link>
            }
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
