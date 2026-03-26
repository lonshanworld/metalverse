"use client";

import { X } from "lucide-react";

type Props = {
  title: string;
  content: string;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

export function LegalDocumentDialog({ title, content, loading, error, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[13300] flex items-center justify-center bg-black/45 p-4">
      <div className="flex h-[min(78vh,640px)] w-full max-w-[780px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between px-5 pb-2 pt-5">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs text-slate-500">Updated 16 May 2025</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close document"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mx-5 h-px bg-slate-200" />

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          {loading ? <p className="text-sm text-slate-500">Loading document...</p> : null}
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          {!loading && !error ? <pre className="whitespace-pre-wrap font-sans text-xs leading-5 text-slate-800">{content}</pre> : null}
        </div>

        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-full rounded-xl border border-slate-300 text-base font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
