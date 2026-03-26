"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

interface SearchableSelectProps {
  placeholder?: string;
  searchPlaceholder?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export default function SearchableSelect({
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  options,
  value,
  onChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-white hover:border-gray-300 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] transition">
        <span className={value ? "text-gray-800" : "text-gray-400"}>{value || placeholder}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-gray-100">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input autoFocus type="text" placeholder={searchPlaceholder} value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none" />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">No results found</p>
            ) : (
              filtered.map((option) => (
                <button key={option} type="button"
                  onClick={() => { onChange(option); setOpen(false); setSearch(""); }}
                  className={`w-full text-left px-4 py-3 text-sm font-semibold transition hover:bg-gray-50 ${value === option ? "bg-[#EEF5FC] text-[#3C7ACB]" : "text-gray-800"}`}>
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
