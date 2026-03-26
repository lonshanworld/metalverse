export type EventStatus = "pending" | "active" | "completed" | "revision";

export interface Applicant {
  id: number;
  initials: string;
  name: string;
  email: string;
  phone: string;
  appliedDate: string;
}

export interface MockEvent {
  id: string;
  name: string;
  type: string;
  status: EventStatus;
  description: string;
  eventDates: string[];
  locationName: string;
  locationAddress: string;
  totalSeats: number;
  filledSeats: number;
  image: string;
  registrationPeriod: string;
  applicants: Applicant[];
}

export const mockEvents: MockEvent[] = [
  {
    id: "digital-marketing-masterclass-2026",
    name: "Digital Marketing Masterclass 2026",
    type: "Masterclass",
    status: "active",
    description: "Join us for an intensive Digital Marketing Masterclass where you'll learn the latest strategies in social media marketing, SEO, content creation, and digital advertising. This hands-on workshop is designed for professionals looking to enhance their digital marketing skills.",
    eventDates: ["Wednesday, April 15, 2026 at 09:00 (GMT+7)", "Thursday, April 16, 2026 at 09:00 (GMT+7)"],
    locationName: "Grand Ballroom, Innovation Center",
    locationAddress: "123 Business Street, Jakarta, Indonesia",
    totalSeats: 150,
    filledSeats: 3,
    image: "https://picsum.photos/seed/mkting26/800/420",
    registrationPeriod: "3/1/2026 - 4/10/2026",
    applicants: [
      { id: 1, initials: "SJ", name: "Sarah Johnson", email: "sarah.johnson@email.com", phone: "+62 812-3456-7890", appliedDate: "Mar 5, 2026" },
      { id: 2, initials: "MC", name: "Michael Chen", email: "michael.chen@email.com", phone: "+62 813-4567-8901", appliedDate: "Mar 6, 2026" },
      { id: 3, initials: "ER", name: "Emily Rodriguez", email: "emily.r@email.com", phone: "+62 814-5678-9012", appliedDate: "Mar 7, 2026" },
    ],
  },
  {
    id: "web-development-bootcamp",
    name: "Web Development Bootcamp",
    type: "Short Course / Bootcamp / Workshop",
    status: "active",
    description: "An intensive 8-week bootcamp covering HTML, CSS, JavaScript, React, Node.js, and modern web development practices. Perfect for beginners and those looking to switch careers into tech.",
    eventDates: ["Thursday, May 1, 2026 at 09:00 (GMT+7)"],
    locationName: "Online",
    locationAddress: "",
    totalSeats: 50,
    filledSeats: 2,
    image: "https://picsum.photos/seed/wdevboot/800/420",
    registrationPeriod: "3/15/2026 - 4/25/2026",
    applicants: [
      { id: 1, initials: "DK", name: "David Kim", email: "david.kim@email.com", phone: "+62 815-6789-0123", appliedDate: "Mar 8, 2026" },
      { id: 2, initials: "JM", name: "Jessica Martinez", email: "jessica.m@email.com", phone: "+62 816-7890-1234", appliedDate: "Mar 9, 2026" },
    ],
  },
  {
    id: "design-thinking-workshop",
    name: "Design Thinking Workshop",
    type: "Short Course / Bootcamp / Workshop",
    status: "completed",
    description: "A hands-on workshop that teaches the design thinking methodology for solving complex problems creatively and collaboratively. Participants will learn to empathize, define, ideate, prototype, and test.",
    eventDates: ["Saturday, March 1, 2026 at 10:00 (GMT+7)"],
    locationName: "Creative Hub Singapore",
    locationAddress: "10 Design Road, Singapore",
    totalSeats: 30,
    filledSeats: 2,
    image: "https://picsum.photos/seed/dsgthink/800/420",
    registrationPeriod: "2/1/2026 - 2/25/2026",
    applicants: [
      { id: 1, initials: "AL", name: "Alice Lee", email: "alice.lee@email.com", phone: "+65 9123-4567", appliedDate: "Feb 5, 2026" },
      { id: 2, initials: "BT", name: "Ben Tan", email: "ben.t@email.com", phone: "+65 9234-5678", appliedDate: "Feb 6, 2026" },
    ],
  },
  {
    id: "ai-machine-learning-summit",
    name: "AI & Machine Learning Summit",
    type: "Conference",
    status: "pending",
    description: "A premier conference bringing together AI researchers, practitioners, and enthusiasts to discuss the latest breakthroughs in artificial intelligence and machine learning.",
    eventDates: ["Wednesday, June 10, 2026 at 08:00 (GMT+7)"],
    locationName: "Bali International Convention Centre",
    locationAddress: "Jl. BICC, Nusa Dua, Bali, Indonesia",
    totalSeats: 200,
    filledSeats: 0,
    image: "https://picsum.photos/seed/aimlsummit/800/420",
    registrationPeriod: "4/1/2026 - 6/1/2026",
    applicants: [],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export const STATUS_STYLES: Record<EventStatus, { dot: string; text: string; bg: string; label: string }> = {
  active: { dot: "bg-[#059669]", text: "text-[#059669]", bg: "bg-[#ECFDF5]", label: "Active" },
  pending: { dot: "bg-yellow-500", text: "text-yellow-600", bg: "bg-yellow-50", label: "Pending" },
  completed: { dot: "bg-indigo-400", text: "text-indigo-700", bg: "bg-indigo-50", label: "Completed" },
  revision: { dot: "bg-orange-500", text: "text-orange-600", bg: "bg-orange-50", label: "Revision" },
};
