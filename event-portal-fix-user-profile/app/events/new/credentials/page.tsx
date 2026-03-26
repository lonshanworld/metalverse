"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DateInput from "@/components/DateInput";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Upload, ShieldCheck, FileText, Trash2 } from "lucide-react";
import { useEventCreate, Credential, NameBox, Distribution } from "../EventCreateContext";

// ─── Colours ──────────────────────────────────────────────────────────────────

const COLORS: { name: string; hex: string }[] = [
  { name: "Success Green", hex: "rgb(90, 217, 175)" },
  { name: "Info Blue", hex: "#79aaf9" },
  { name: "Error Rose", hex: "#f36b81" },
  { name: "Warning Amber", hex: "#f9b94a" },
  { name: "Purple", hex: "#b699f9" },
  { name: "Indigo", hex: "#9b9def" },
];

// ─── ColorWheel ───────────────────────────────────────────────────────────────

function ColorWheel({ color, onChange }: { color: string; onChange: (hex: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const SIZE = 180, R = SIZE / 2;
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    for (let a = 0; a < 360; a++) {
      const grad = ctx.createRadialGradient(R, R, 0, R, R, R);
      grad.addColorStop(0, "#fff"); grad.addColorStop(1, `hsl(${a},100%,50%)`);
      ctx.beginPath(); ctx.moveTo(R, R);
      ctx.arc(R, R, R, (a - 1) * Math.PI / 180, (a + 1) * Math.PI / 180);
      ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    }
    const dark = ctx.createRadialGradient(R, R, 0, R, R, R);
    dark.addColorStop(0, "rgba(0,0,0,0)"); dark.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.beginPath(); ctx.arc(R, R, R, 0, Math.PI * 2); ctx.fillStyle = dark; ctx.fill();
  }, [R]);
  const pick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const p = c.getContext("2d")!.getImageData(e.clientX - r.left, e.clientY - r.top, 1, 1).data;
    onChange(`#${p[0].toString(16).padStart(2, "0")}${p[1].toString(16).padStart(2, "0")}${p[2].toString(16).padStart(2, "0")}`);
  }, [onChange]);
  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="rounded-full cursor-crosshair shadow-md"
        onMouseDown={e => { dragging.current = true; pick(e); }} onMouseMove={e => { if (dragging.current) pick(e); }}
        onMouseUp={() => { dragging.current = false; }} onMouseLeave={() => { dragging.current = false; }} />
      <div className="flex items-center gap-2 w-full">
        <div className="w-7 h-7 rounded-md border border-gray-200 flex-shrink-0" style={{ backgroundColor: color }} />
        <input type="text" value={color} onChange={e => onChange(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB]" />
      </div>
    </div>
  );
}

// ─── BadgePreview ─────────────────────────────────────────────────────────────

function BadgePreview({ color, logoPreview, uid }: { color: string; logoPreview: string | null; uid: number }) {
  const logoClipId = `logo-clip-${uid}`, filterId = `filter0_di_${uid}`, gradientId = `paint0_linear_${uid}`;
  const logoPath = "M225.549 360.34L322.086 310.087C325.2 308.466 327.153 305.247 327.153 301.736V237.845V180.477V167.532C327.153 164.247 325.401 161.211 322.556 159.569L310.09 152.372L293.027 142.198L292.389 141.818C289.465 140.074 285.827 140.045 282.876 141.742L226.807 173.978C223.902 175.648 220.329 175.649 217.424 173.979L160.638 141.349C158.143 139.447 154.751 139.23 152.034 140.798L150.341 141.776L116.91 159.13C114.841 160.324 113.566 162.531 113.566 164.92V301.693C113.566 305.226 115.545 308.462 118.69 310.073L216.911 360.369C219.625 361.759 222.844 361.748 225.549 360.34Z";
  const lx = 113.566, ly = 141.349, lw = 327.153 - 113.566, lh = 360.369 - 141.349, inset = 0.12;
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-8">Badge Preview</label>
      <div className="flex flex-col items-center gap-2">
        <div style={{ width: 160, height: Math.round(160 * 504 / 442) }}>
          <svg viewBox="0 0 442 504" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
            <defs>
              <filter id={filterId} x="0.00015831" y="0.000110626" width="441.132" height="503.606" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" /><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" /><feOffset dy="17.0634" /><feGaussianBlur stdDeviation="15.8866" /><feComposite in2="hardAlpha" operator="out" /><feColorMatrix type="matrix" values="0 0 0 0 0.496154 0 0 0 0 0.496154 0 0 0 0 0.496154 0 0 0 0.07 0" /><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" /><feOffset dy="-5.80044" /><feGaussianBlur stdDeviation="9.18404" /><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" /><feColorMatrix type="matrix" values="0 0 0 0 0.0538277 0 0 0 0 0.210592 0 0 0 0 0.394231 0 0 0 0.1 0" /><feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
              </filter>
              <linearGradient id={gradientId} x1="89.9429" y1="117.355" x2="384.728" y2="304.464" gradientUnits="userSpaceOnUse"><stop stopColor="white" /><stop offset="1" stopColor="#F1EEEE" stopOpacity="0.4" /></linearGradient>
              <clipPath id={logoClipId}><path d={logoPath} /></clipPath>
            </defs>
            <g filter={`url(#${filterId})`}>
              <path d="M215.802 16.004C218.744 14.2782 222.389 14.2782 225.33 16.004L404.71 121.246C407.59 122.936 409.36 126.026 409.36 129.366V340.113C409.36 343.453 407.59 346.543 404.71 348.233L225.33 453.475C222.389 455.2 218.744 455.2 215.802 453.475L36.4232 348.233C33.5425 346.543 31.7729 343.453 31.7729 340.113V129.366C31.7729 126.026 33.5425 122.936 36.4232 121.246L215.802 16.004Z" fill="white" />
              <path d="M216.101 16.5117C218.858 14.894 222.275 14.8939 225.032 16.5117L404.412 121.753C407.113 123.337 408.771 126.235 408.771 129.366V340.113C408.771 343.244 407.113 346.141 404.412 347.726L225.032 452.967C222.275 454.585 218.858 454.585 216.101 452.967L36.7207 347.726C34.0202 346.141 32.3615 343.244 32.3613 340.113V129.366C32.3613 126.235 34.02 123.337 36.7207 121.753L216.101 16.5117Z" stroke={`url(#${gradientId})`} strokeWidth="1.17679" />
            </g>
            <path d="M215.009 38.2382C217.949 36.5142 221.592 36.5142 224.532 38.2382L378.943 128.774C381.825 130.463 383.595 133.554 383.595 136.895V318.219C383.595 321.56 381.825 324.65 378.943 326.34L224.532 416.876C221.592 418.6 217.949 418.6 215.009 416.876L60.5979 326.34C57.7159 324.65 55.9454 321.56 55.9454 318.219V136.895C55.9454 133.554 57.7159 130.463 60.5979 128.774L215.009 38.2382Z" fill="white" />
            <path d="M322.216 326.537L224.095 382.436C222.036 383.591 219.508 383.591 217.448 382.436L118.578 326.075C116.518 324.92 113.99 324.92 111.93 326.075L85.9019 340.905C81.4546 343.445 81.4546 349.775 85.9019 352.315L201.157 417.962L217.495 427.294C219.554 428.449 222.082 428.449 224.142 427.294L240.48 417.962L354.986 352.731C359.433 350.19 359.433 343.861 354.986 341.32L328.958 326.491C326.898 325.336 324.37 325.336 322.31 326.491L322.216 326.537Z" fill={color} />
            <path d="M388.064 137.572V295.245C388.064 300.327 382.493 303.468 378.046 300.927L352.017 286.098C349.957 284.943 348.693 282.771 348.693 280.415V160.024C348.693 157.668 347.429 155.497 345.37 154.342L313.068 135.955L292.049 123.99C289.989 122.835 287.461 122.835 285.355 123.99L273.698 130.643L240.133 149.769L223.795 159.1C221.735 160.255 219.207 160.255 217.148 159.1L200.81 149.769L165.746 129.765L155.588 123.99C153.528 122.835 151 122.835 148.893 123.99L126.376 136.833L95.5728 154.388C93.513 155.543 92.2491 157.714 92.2491 160.071V279.63C92.2491 281.986 90.9851 284.157 88.9253 285.312L62.897 300.142C58.4497 302.683 52.8789 299.495 52.8789 294.459V137.572C52.8789 135.216 54.1429 133.045 56.2027 131.89L72.5406 122.558L103.672 104.818L112.847 99.5979L132.509 88.3719L142.995 82.3662L152.17 77.1459L200.763 49.4735L217.101 40.1416C219.16 38.9867 221.688 38.9867 223.748 40.1416L240.086 49.4735L288.679 77.1459L297.105 81.9504L308.34 88.3719L328.002 99.5979L336.428 104.402L368.308 122.558L384.646 131.89C386.706 133.045 387.97 135.216 387.97 137.572H388.064Z" fill={color} />
            <path d={logoPath} fill="white" />
            {logoPreview
              ? <image href={logoPreview} x={lx + lw * inset} y={ly + lh * inset} width={lw * (1 - inset * 2)} height={lh * (1 - inset * 2)} clipPath={`url(#${logoClipId})`} preserveAspectRatio="xMidYMid meet" />
              : <g clipPath={`url(#${logoClipId})`}><path d={logoPath} fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="9 6" /><text x="220.5" y="242" textAnchor="middle" fill="#94A3B8" fontSize="20" fontWeight="700" fontFamily="system-ui,sans-serif" letterSpacing="1.5">YOUR LOGO</text><text x="220.5" y="268" textAnchor="middle" fill="#CBD5E1" fontSize="15" fontFamily="system-ui,sans-serif">will appear here</text></g>
            }
          </svg>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
          <span className="text-xs text-gray-400 font-mono">{color}</span>
        </div>
      </div>
    </div>
  );
}

// ─── CertificatePreview ───────────────────────────────────────────────────────

type HandleDir = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se" | "move";
function CertificatePreview({ src, isPdf, nameBox, onNameBoxChange, containerW, containerH }: {
  src: string; isPdf: boolean; nameBox: NameBox; onNameBoxChange: (b: NameBox) => void;
  containerW: number; containerH: number;
}) {
  const [previewAspect, setPreviewAspect] = useState("1324 / 500");
  useEffect(() => {
    if (isPdf) { setPreviewAspect("1324 / 500"); return; }
    if (!src) return;
    const img = new Image();
    img.onload = () => setPreviewAspect(`${img.naturalWidth} / ${img.naturalHeight}`);
    img.onerror = () => setPreviewAspect("1324 / 500");
    img.src = src;
  }, [src, isPdf]);
  const px = { x: (nameBox.x / 100) * containerW, y: (nameBox.y / 100) * containerH, w: (nameBox.w / 100) * containerW, h: (nameBox.h / 100) * containerH };
  const nameFontSize = Math.max(10, Math.min(px.w * 0.18, px.h * 0.65));
  const drag = useRef<{ dir: HandleDir; sx: number; sy: number; obPx: typeof px } | null>(null);
  const handleMove = useCallback((cx: number, cy: number) => {
    if (!drag.current || !containerW || !containerH) return;
    const { dir, sx, sy, obPx } = drag.current;
    const dx = cx - sx, dy = cy - sy;
    let { x, y, w, h } = obPx;
    const minW = Math.max(40, containerW * 0.08), minH = Math.max(20, containerH * 0.04);
    const maxW = containerW * 0.55, maxH = containerH * 0.20;
    if (dir === "move") { x += dx; y += dy; }
    if (dir === "e" || dir === "ne" || dir === "se") w = Math.min(maxW, Math.max(minW, w + dx));
    if (dir === "s" || dir === "sw" || dir === "se") h = Math.min(maxH, Math.max(minH, h + dy));
    if (dir === "w" || dir === "nw" || dir === "sw") { w = Math.min(maxW, Math.max(minW, w - dx)); x = obPx.x + obPx.w - w; }
    if (dir === "n" || dir === "nw" || dir === "ne") { h = Math.min(maxH, Math.max(minH, h - dy)); y = obPx.y + obPx.h - h; }
    x = Math.max(0, Math.min(containerW - w, x)); y = Math.max(0, Math.min(containerH - h, y));
    onNameBoxChange({ x: (x / containerW) * 100, y: (y / containerH) * 100, w: (w / containerW) * 100, h: (h / containerH) * 100 });
  }, [onNameBoxChange, containerW, containerH]);
  useEffect(() => {
    const up = () => { drag.current = null; };
    const mv = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, [handleMove]);
  useEffect(() => {
    const mv = (e: TouchEvent) => { if (!drag.current) return; e.preventDefault(); const t = e.touches[0]; handleMove(t.clientX, t.clientY); };
    const up = () => { drag.current = null; };
    window.addEventListener("touchmove", mv, { passive: false }); window.addEventListener("touchend", up); window.addEventListener("touchcancel", up);
    return () => { window.removeEventListener("touchmove", mv); window.removeEventListener("touchend", up); window.removeEventListener("touchcancel", up); };
  }, [handleMove]);
  const startMouse = (e: React.MouseEvent, dir: HandleDir) => { e.preventDefault(); e.stopPropagation(); drag.current = { dir, sx: e.clientX, sy: e.clientY, obPx: { ...px } }; };
  const startTouch = (e: React.TouchEvent, dir: HandleDir) => { e.stopPropagation(); const t = e.touches[0]; drag.current = { dir, sx: t.clientX, sy: t.clientY, obPx: { ...px } }; };
  const handles: { dir: HandleDir; style: React.CSSProperties; cursor: string }[] = [
    { dir: "n", cursor: "n-resize", style: { top: -4, left: "50%", transform: "translateX(-50%)", width: 24, height: 8 } },
    { dir: "s", cursor: "s-resize", style: { bottom: -4, left: "50%", transform: "translateX(-50%)", width: 24, height: 8 } },
    { dir: "e", cursor: "e-resize", style: { right: -4, top: "50%", transform: "translateY(-50%)", width: 8, height: 24 } },
    { dir: "w", cursor: "w-resize", style: { left: -4, top: "50%", transform: "translateY(-50%)", width: 8, height: 24 } },
    { dir: "nw", cursor: "nw-resize", style: { top: -5, left: -5, width: 12, height: 12 } },
    { dir: "ne", cursor: "ne-resize", style: { top: -5, right: -5, width: 12, height: 12 } },
    { dir: "sw", cursor: "sw-resize", style: { bottom: -5, left: -5, width: 12, height: 12 } },
    { dir: "se", cursor: "se-resize", style: { bottom: -5, right: -5, width: 12, height: 12 } },
  ];
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-1">Certificate Preview</p>
      <p className="text-xs text-gray-400 mb-3">Drag the box to reposition. Drag any edge or corner handle to resize.</p>
      <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 select-none" style={{ aspectRatio: previewAspect }}>
        {isPdf ? <iframe src={src} className="absolute inset-0 w-full h-full border-0" title="Certificate template" />
          // eslint-disable-next-line @next/next/no-img-element
          : <img src={src} alt="certificate" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute bottom-3 right-3 bg-white rounded-xl shadow-lg px-3 py-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/org/logo.svg" alt="logo" className="w-4 h-4" />
            <p className="text-[16px] font-normal leading-tight tracking-tight" style={{ color: "#3C3936" }}>medalverse</p>
          </div>
          <p className="text-[9px] font-bold leading-tight tracking-wider" style={{ color: "#3C3936" }}>203498570293485345</p>
        </div>
        <div onMouseDown={e => startMouse(e, "move")} onTouchStart={e => startTouch(e, "move")}
          className="absolute cursor-move touch-none" style={{ left: px.x, top: px.y, width: px.w, height: px.h }}>
          <div className="w-full h-full border-2 border-dashed border-[#3C7ACB] rounded bg-white/20 hover:bg-white/40 active:bg-white/40 transition flex items-center justify-center overflow-hidden">
            <span className="font-medium text-[#3C7ACB] select-none pointer-events-none text-center" style={{ fontSize: `${nameFontSize}px`, lineHeight: 1.1 }}>Participant Name</span>
          </div>
          {handles.map(({ dir, cursor, style }) => (
            <div key={dir} onMouseDown={e => startMouse(e, dir)} onTouchStart={e => startTouch(e, dir)}
              className="absolute rounded-sm bg-white border-2 border-[#3C7ACB] z-10 touch-none"
              style={{ ...style, cursor, position: "absolute", minWidth: 24, minHeight: 24 }} />
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1.5">Position: X:{Math.round(nameBox.x)}%, Y:{Math.round(nameBox.y)}% | Size:{Math.round(nameBox.w)}%×{Math.round(nameBox.h)}%</p>
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-800 mb-1.5">{children}</label>;
}
function TextInput({ placeholder, value, onChange }: { placeholder?: string; value: string; onChange: (v: string) => void }) {
  return <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] transition" />;
}
function SectionHeading({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="flex items-center gap-2 mb-5"><span className="text-[#3C7ACB]">{icon}</span><h3 className="text-base font-semibold text-gray-900" style={{ fontFamily: "Chillax, sans-serif" }}>{children}</h3></div>;
}

// ─── CredentialForm ───────────────────────────────────────────────────────────

function CredentialForm({ cred, index, onChange }: { cred: Credential; index: number; onChange: (id: number, field: keyof Credential, value: unknown) => void }) {
  const set = (field: keyof Credential, value: unknown) => onChange(cred.id, field, value);
  const logoRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [showWheel, setShowWheel] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 600, h: 227 });

  useEffect(() => {
    if (!showWheel) return;
    const h = (e: MouseEvent) => { if (wheelRef.current && !wheelRef.current.contains(e.target as Node)) setShowWheel(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [showWheel]);

  useEffect(() => {
    if (!previewRef.current) return;
    const ro = new ResizeObserver(entries => {
      const el = entries[0].contentRect;
      setContainerSize({ w: el.width, h: el.height });
      if (cred.nameBox.x === -1) {
        const wPct = 38, hPct = 9;
        onChange(cred.id, "nameBox", { x: (100 - wPct) / 2, y: (100 - hPct) / 2, w: wPct, h: hPct });
      }
    });
    ro.observe(previewRef.current); return () => ro.disconnect();
  }, [cred.certPreview, cred.nameBox.x, cred.id, onChange]);

  const handleCert = (f: File) => {
    set("certPreview", URL.createObjectURL(f)); set("certIsPdf", f.type === "application/pdf");
    set("certTemplate", f); set("nameBox", { x: -1, y: -1, w: 240, h: 44 });
  };
  const handleLogo = (f: File) => { set("logo", f); set("logoPreview", URL.createObjectURL(f)); };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-7">
      <h2 className="text-xl font-semibold text-gray-900 mb-6" style={{ fontFamily: "Chillax, sans-serif" }}>Credential {index + 1}</h2>

      <div className="mb-8">
        <FieldLabel>Award Name</FieldLabel>
        <TextInput placeholder="e.g., First Place Trophy, Certificate of Excellence" value={cred.awardName} onChange={v => set("awardName", v)} />
      </div>

      <div className="mb-8">
        <SectionHeading icon={<ShieldCheck size={18} />}>Badge Design</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <FieldLabel>Badge Color</FieldLabel>
            <div className="flex gap-2 mb-3 mt-1 flex-wrap">
              {COLORS.map(c => (
                <button key={c.hex} type="button" onClick={() => { set("color", c.hex); set("colorName", c.name); setShowWheel(false); }}
                  className={`w-10 h-10 rounded-xl transition-all ${cred.color === c.hex && !showWheel ? "ring-2 ring-offset-2 ring-gray-600 scale-105" : "hover:scale-105"}`}
                  style={{ backgroundColor: c.hex }} />
              ))}
              <button type="button" onClick={() => setShowWheel(v => !v)} title="Custom colour"
                className={`w-10 h-10 rounded-xl border-2 border-gray-300 overflow-hidden transition-all hover:scale-105 ${showWheel ? "ring-2 ring-offset-2 ring-gray-600 scale-105" : ""}`}
                style={{ background: "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)" }} />
            </div>
            {showWheel
              ? <div ref={wheelRef} className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 inline-block"><ColorWheel color={cred.color} onChange={hex => { set("color", hex); set("colorName", "Custom"); }} /></div>
              : <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-gray-200" style={{ backgroundColor: cred.color }} />
                <input type="text" value={cred.color} onChange={e => set("color", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] font-mono" />
              </div>
            }
            <p className="text-xs text-gray-400 mt-1.5">Selected: {cred.colorName}</p>
          </div>

          <div className="md:ml-12 xl:ml-24">
            <FieldLabel>Upload Logo</FieldLabel>
            <div className="text-gray-400 text-sm my-2">Recommend: 114x118</div>
            <div onClick={() => logoRef.current?.click()} onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleLogo(f); }}
              className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition min-h-[140px] aspect-[114/118] max-h-[200px]">
              {cred.logoPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={cred.logoPreview} alt="logo" className="max-h-16 object-contain rounded" />
                : <><Upload size={22} className="text-gray-400" /><p className="text-sm text-gray-500">Upload Logo</p><p className="text-xs text-gray-400">PNG, SVG up to 2MB</p></>
              }
            </div>
            <input ref={logoRef} type="file" accept="image/png,image/svg+xml" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleLogo(f); }} />
          </div>

          <BadgePreview color={cred.color} logoPreview={cred.logoPreview} uid={cred.id} />
        </div>
      </div>

      <div className="mb-8">
        <SectionHeading icon={<FileText size={18} />}>Certificate Design</SectionHeading>
        <FieldLabel>Upload Certificate Template</FieldLabel>
        <div onClick={() => certRef.current?.click()} onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleCert(f); }}
          className="border-2 border-dashed border-[#3C7ACB]/40 rounded-xl p-10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50/30 transition min-h-[160px]">
          <Upload size={24} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-600">{cred.certPreview ? "Click or drag to replace template" : "Upload Certificate Template"}</p>
          <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
          {cred.certPreview && <p className="text-xs font-medium text-green-600 mt-1">✓ Template uploaded</p>}
        </div>
        <input ref={certRef} type="file" accept="image/png,image/jpeg,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleCert(f); }} />
        {cred.certPreview && (
          <div className="mt-6" ref={previewRef}>
            <CertificatePreview src={cred.certPreview} isPdf={cred.certIsPdf} nameBox={cred.nameBox}
              containerW={containerSize.w} containerH={containerSize.h}
              onNameBoxChange={box => set("nameBox", box)} />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-5">Credential Information</h3>
        <div className="mb-5">
          <FieldLabel>Issued Date</FieldLabel>
          <DateInput value={cred.issuedDate} onChange={v => set("issuedDate", v)} />
          <p className="text-xs text-gray-400 mt-1">Must be a date during the event period</p>
        </div>
        <div className="mb-5">
          <FieldLabel>Rank</FieldLabel>
          <TextInput placeholder="e.g., 1st Place, Winner, Participant" value={cred.rank} onChange={v => set("rank", v)} />
        </div>
        <div className="mb-5">
          <FieldLabel>Distribution</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            {(["all", "specific"] as Distribution[]).map(d => (
              <button key={d} type="button" onClick={() => set("distribution", d)}
                className={`py-3 rounded-xl border text-sm font-medium transition ${cred.distribution === d ? "border-[#3C7ACB] bg-[#EEF5FC] text-[#3C7ACB]" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                {d === "all" ? "All Participants" : "Specific Participants"}
              </button>
            ))}
          </div>
          {cred.distribution === "specific" && (
            <div className="mt-3"><FieldLabel>Number of Participants</FieldLabel><TextInput placeholder="e.g. 10" value={cred.numParticipants} onChange={v => set("numParticipants", v)} /></div>
          )}
        </div>
        <div>
          <FieldLabel>Requirements</FieldLabel>
          <textarea placeholder="Brief description of requirements to earn this credential"
            value={cred.requirements} onChange={e => set("requirements", e.target.value)} rows={4}
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#3C7ACB] resize-none" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateCredentialsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const { credentials, setCredentials } = useEventCreate();

  const removeCredential = (id: number) => setCredentials(prev => prev.filter(c => c.id !== id));
  const updateCredential = (id: number, field: keyof Credential, value: unknown) =>
    setCredentials(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

  // Every credential must have all required fields filled
  const canProceed = useMemo(() => credentials.every(c =>
    c.awardName.trim() !== "" &&
    (c.logo !== null || editId) &&
    (c.certPreview !== null || editId) &&
    c.issuedDate.trim() !== "" &&
    c.rank.trim() !== "" &&
    c.requirements.trim() !== "" &&
    (c.distribution !== "specific" || (c.numParticipants.trim() !== "" && Number(c.numParticipants) > 0))
  ), [credentials, editId]);

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm mx-3 mt-2 rounded-2xl shadow-sm">
        <Link href="/events/new/optional" className="text-gray-500 hover:text-gray-700 transition"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "Chillax, sans-serif" }}>Create Credentials</h1>
          <p className="text-sm text-gray-500 mt-0.5">Design and configure credentials for your event participants</p>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-5">
        <div className="bg-[#EEF5FC] border border-[#3C7ACB]/30 rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-[#3C7ACB] mb-1">Please Note</p>
          <p className="text-sm text-[#3C7ACB] leading-relaxed">
            You may modify credential information and settings at any time after creation. However, fees paid for credential creation are non-refundable once the order has been processed.
          </p>
        </div>

        {credentials.map((cred, i) => (
          <div key={cred.id} className="relative">
            {i > 0 && (
              <button type="button" onClick={() => removeCredential(cred.id)}
                className="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50">
                <Trash2 size={16} />
              </button>
            )}
            <CredentialForm cred={cred} index={i} onChange={updateCredential} />
          </div>
        ))}

        <div className="flex items-center justify-between pb-6">
          <Link href="/events/new/optional" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Back</Link>
          <button
            type="button"
            disabled={!canProceed}
            onClick={() => { if (canProceed) router.push("/events/new/participants"); }}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition shadow-sm ${canProceed ? "text-white bg-[#3C7ACB] hover:opacity-90" : "text-gray-400 bg-gray-200 cursor-not-allowed"}`}
          >
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
