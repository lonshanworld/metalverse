"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateInputProps {
  value: string; // ISO yyyy-mm-dd
  onChange: (v: string) => void;
  className?: string;
}

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sat", "Su"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function toISO(display: string): string {
  const parts = display.replace(/\D/g, "");
  if (parts.length < 8) return "";
  return `${parts.slice(4, 8)}-${parts.slice(2, 4)}-${parts.slice(0, 2)}`;
}

function formatTyped(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  // Monday = 0
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function DateInput({ value, onChange, className = "" }: DateInputProps) {
  const [typed, setTyped] = useState(toDisplay(value));
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleTyped = (raw: string) => {
    const formatted = formatTyped(raw);
    setTyped(formatted);
    const iso = toISO(formatted);
    if (iso) {
      onChange(iso);
      const d = new Date(iso + "T00:00:00");
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  };

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const iso = `${viewYear}-${mm}-${dd}`;
    onChange(iso);
    setTyped(toDisplay(iso));
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);
  // Days from prev month to show
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1 < 0 ? 11 : viewMonth - 1);

  const cells: { day: number; type: "prev" | "cur" | "next" }[] = [];
  for (let i = firstDow - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, type: "prev" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: "cur" });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - firstDow + 1, type: "next" });

  const isSelected = (day: number) =>
    selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/yyyy"
          value={typed}
          onChange={(e) => handleTyped(e.target.value)}
          onFocus={() => setOpen(true)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] transition cursor-pointer"
        />
        <button type="button" onClick={() => setOpen(o => !o)}
          className="absolute right-3 text-gray-400 hover:text-gray-600 transition z-10">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="15" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-72 select-none"
          style={{ top: "100%", left: 0 }}>
          {/* Month/Year header */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-gray-800">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day-of-week labels */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((cell, i) => {
              const isCur = cell.type === "cur";
              const sel = isCur && isSelected(cell.day);
              const tod = isCur && isToday(cell.day) && !sel;
              return (
                <button key={i} type="button"
                  onClick={() => isCur && selectDay(cell.day)}
                  className={`
                    h-9 w-full flex items-center justify-center rounded-full text-sm transition
                    ${!isCur ? "text-gray-300 cursor-default" : "cursor-pointer hover:bg-blue-50 hover:text-[#3C7ACB]"}
                    ${sel ? "bg-[#DBEAFE] text-[#3C7ACB] font-semibold" : ""}
                    ${tod ? "font-semibold text-gray-800" : ""}
                    ${isCur && !sel && !tod ? "text-gray-700" : ""}
                  `}>
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
