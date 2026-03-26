"use client";

import { useEffect } from "react";
import { X, Info } from "lucide-react";

interface ToastProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

export default function Toast({ title, subtitle, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-[200] flex items-start gap-3 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 min-w-[280px] max-w-xs animate-in slide-in-from-top-2">
      <div className="relative flex-shrink-0 mt-0.5 w-12 h-12 flex items-center justify-center">
        <div className="absolute w-11 h-11 rounded-full border-2 border-[#3C7ACB]/20" />
        <div className="absolute w-8 h-8 rounded-full border-2 border-[#3C7ACB]/40" />
        <div className="relative w-5 h-5 rounded-full flex items-center justify-center bg-white">
          <Info size={20} className="text-[#3C7ACB]" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 mt-0.5">
        <X size={14} />
      </button>
    </div>
  );
}
