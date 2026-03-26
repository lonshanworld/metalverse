"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";

const navItems = [
  // { href: "/",              label: "Dashboard",     icon: LayoutDashboard },
  // { href: "/advertisement", label: "Advertisement", icon: Megaphone },
  { href: "/events", label: "Events", icon: CalendarDays },
  // { href: "/credentials",   label: "Credentials",   icon: BadgeCheck },
];

export default function Sidebar({ minimized = false }: { minimized?: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="w-full min-h-screen flex flex-col py-3 px-2 flex-shrink-0 relative z-10">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col flex-1 py-5 overflow-hidden"
        style={{ paddingLeft: minimized ? "8px" : "12px", paddingRight: minimized ? "8px" : "12px" }}>

        {/* Logo */}
        <div className={`flex items-center mb-7 transition-all duration-300 ${minimized ? "justify-center px-0" : "gap-2 pl-2"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/org/logo.svg" alt="logo" style={{ width: "17px", height: "19.27px", flexShrink: 0 }} />
          <span
            className="transition-all duration-200 overflow-hidden whitespace-nowrap"
            style={{
              fontFamily: "Chillax, sans-serif",
              fontWeight: 500,
              fontSize: "21.2px",
              lineHeight: "32px",
              color: "#3C3936",
              maxWidth: minimized ? "0px" : "200px",
              opacity: minimized ? 0 : 1,
            }}
          >
            Credential Portal
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={minimized ? label : undefined}
              className={`flex items-center rounded-xl font-medium transition-colors duration-150
                ${minimized
                  ? "flex-col gap-1 py-3 px-1 justify-center"
                  : "flex-row gap-3 px-3 py-2.5"
                }
                ${isActive(href)
                  ? "bg-[#EEF5FC] text-[#3C7ACB]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {minimized ? (
                <span className="text-sm font-medium leading-tight text-center">{label}</span>
              ) : (
                <span className="text-sm">{label}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
