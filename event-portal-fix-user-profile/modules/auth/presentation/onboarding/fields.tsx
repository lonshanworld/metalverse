import { type ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function FieldLabel({ label }: { label: string }) {
  return <p className="text-[18px] font-semibold text-slate-800">{label}</p>;
}

export function TextField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-800 outline-none ring-2 ring-transparent placeholder:text-slate-400 focus:ring-sky-200"
    />
  );
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<"down" | "up">("down");
  const rootRef = useRef<HTMLDivElement>(null);

  function resolveOpenDirection() {
    const viewportPadding = 16;
    const optionHeight = 44;
    const menuHeight = Math.min(256, options.length * optionHeight + 8);
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) {
      return "down" as const;
    }
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    return spaceBelow < menuHeight && spaceAbove > spaceBelow ? "up" : "down";
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${open ? "z-[500]" : "z-10"}`}>
      <button
        type="button"
        onClick={() =>
          setOpen((prev) => {
            if (prev) {
              return false;
            }
            setOpenDirection(resolveOpenDirection());
            return true;
          })
        }
        className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-9 text-left text-base outline-none ring-2 ring-transparent transition focus:ring-sky-200 ${
          value ? "text-slate-800" : "text-slate-400"
        } ${open ? "border-sky-300 ring-sky-200" : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {value || placeholder || "Select option"}
      </button>
      <ChevronDown
        className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition ${
          open ? "rotate-180" : "rotate-0"
        }`}
      />

      {open ? (
        <div
          role="listbox"
          className={`absolute left-0 right-0 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-[0_10px_24px_rgba(15,23,42,0.12)] ${
            openDirection === "down" ? "top-[calc(100%+6px)]" : "bottom-[calc(100%+6px)]"
          }`}
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-base ${
                  selected ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-base transition ${
        active
          ? "border-blue-300 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

export function CheckItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 text-base text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-200"
      />
      <span>{label}</span>
    </label>
  );
}
