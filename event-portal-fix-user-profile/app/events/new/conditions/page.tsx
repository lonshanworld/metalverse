"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, Upload, ShieldCheck, FileText, X } from "lucide-react";
import { useEventCreate } from "../EventCreateContext";

export default function ConditionsPage() {
  const { termsText, setTermsText, termsFile, setTermsFile, requireConsent, setRequireConsent } = useEventCreate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTermsFile(file);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm mx-3 mt-2 rounded-2xl shadow-sm">
        <Link href="/events/new/participants" className="text-gray-500 hover:text-gray-700 transition"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "Chillax, sans-serif" }}>Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Set the rules and guidelines for your event participants</p>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-6">

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-medium text-gray-900 mb-1">Event Terms &amp; Conditions</h2>
          <p className="text-sm text-gray-500 mb-4">Provide the specific terms, refund policies, or rules participants need to know.</p>
          <textarea value={termsText} onChange={e => setTermsText(e.target.value)}
            placeholder="e.g. By registering for this event, you agree to..."
            className="w-full h-40 px-4 py-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C7ACB]/20 focus:border-[#3C7ACB] transition resize-none" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-medium text-gray-900 mb-1">Attach Document (Optional)</h2>
          <p className="text-sm text-gray-500 mb-4">Upload a PDF if you have a detailed terms and conditions document.</p>
          {!termsFile ? (
            <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition group cursor-pointer">
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="w-12 h-12 bg-[#3C7ACB]/10 text-[#3C7ACB] rounded-full flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"><Upload size={24} /></div>
              <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PDF up to 10MB</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-[#3C7ACB]"><FileText size={20} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{termsFile.name}</p>
                  <p className="text-xs text-gray-500">{(termsFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={() => setTermsFile(null)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-md transition"><X size={18} /></button>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-start gap-4">
          <div className="mt-1"><ShieldCheck size={24} className={requireConsent ? "text-[#3C7ACB]" : "text-gray-400"} /></div>
          <div className="flex-1">
            <h2 className="text-base font-medium text-gray-900 mb-1">Require Explicit Consent</h2>
            <p className="text-sm text-gray-500 mb-3">Participants must check a box agreeing to these terms before completing their registration.</p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={requireConsent} onChange={() => setRequireConsent(!requireConsent)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3C7ACB]"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">{requireConsent ? "Enabled" : "Disabled"}</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 pb-6 mt-4 border-t border-gray-100">
          <Link href="/events/new/participants" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Back</Link>
          <div className="flex items-center gap-3">
            <Link href="/events" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Skip</Link>
            <Link href="/events" className="px-6 py-2.5 text-sm font-medium text-white bg-[#3C7ACB] rounded-lg hover:opacity-90 transition shadow-sm">Save &amp; Finish</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
