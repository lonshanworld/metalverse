import { OnboardingFormState, OnboardingStepMeta } from "@/modules/auth/presentation/onboarding/types";

export const ONBOARDING_COMPLETED_KEY = "mv_onboarding_completed";

export const onboardingSteps: OnboardingStepMeta[] = [
  {
    tag: "Basic Info",
    title: "Let’s get to know you 👋",
    subtitle: "Tell us a bit about yourself so we can personalize programs and opportunities just for you.",
  },
  { tag: "Stage & Interests", title: "Where are you now and what excites you?", subtitle: "" },
  { tag: "Goals & Program Types", title: "What do you want to achieve?", subtitle: "" },
  { tag: "Destination & Budget", title: "Your preferences, your possibilities", subtitle: "" },
  { tag: "Timeline & Experience", title: "When are you ready to start?", subtitle: "" },
];

export const stageOptions = [
  "Elementary School student",
  "Middle school student",
  "High school student",
  "Undergraduate student",
  "Gap year / preparing",
  "Graduate student",
  "Working professional",
];

export const interestOptions = [
  "Business & Entrepreneurship",
  "Technology & AI",
  "Engineering & Robotics",
  "Data & Analytics",
  "Science & Research",
  "Medicine & Health",
  "Environment & Sustainability",
  "Social Impact & Community",
  "Law & Public Policy",
  "Education & Teaching",
  "Arts & Design",
  "Media & Communication",
  "Languages & Culture",
  "Hospitality & Tourism",
  "Sports & Wellness",
  "Personal & Career Development",
  "Undecided / Exploring",
  "Other",
];

export const goalOptions = [
  "Strengthen my portfolio or CV",
  "Prepare for university admission",
  "Explore career interests",
  "Gain practical experience",
  "Develop new skills",
  "Networking & connections",
  "Personal growth",
  "Cultural exposure & travel",
  "Achieve awards or competition results",
];

export const programTypeOptions = [
  "Internship",
  "Bootcamp",
  "Workshop",
  "Masterclass",
  "Short course",
  "Online course",
  "Competition",
  "Conference",
  "Volunteer program",
  "Summer camp",
  "Field trip",
  "International camp",
  "Self-exploration camp",
  "Company visit",
];

export const destinationOptions = [
  "My country",
  "Southeast Asia",
  "East Asia",
  "South Asia",
  "Europe",
  "USA",
  "Canada",
  "Australia / New Zealand",
  "Middle East",
  "Africa",
  "Anywhere",
];

export const budgetOptions = [
  "Free only",
  "Under $20",
  "$20-$50",
  "$50-$100",
  "$100-$300",
  "$300-$1,000",
  "$1,000-$3,000",
  "$3,000-$6,000",
  "$6,000+",
  "Depends on value or scholarship",
];

export const joinedBeforeOptions = ["None yet", "1-2 programs", "3-5 programs", "6-10 programs", "10+ programs"];

export const discoveryOptions = [
  "Social Media",
  "Friend or Word of Mouth",
  "University / School",
  "Google Search",
  "Partner Organization",
  "Student Club / Community",
  "Event or Competition",
  "Workshop or Seminar",
  "Other",
];

export const phoneCountryCodeOptions = ["+66", "+1", "+44", "+81", "+82", "+65", "+61"];

export const initialOnboardingFormState: OnboardingFormState = {
  email: "",
  fullName: "",
  username: "",
  phoneCountryCode: "+66",
  phoneNumber: "",
  stage: "",
  interests: [],
  otherInterest: "",
  goals: [],
  programTypes: [],
  budget: "",
  destinations: [],
  joinedBefore: "",
  discoveryChannels: [],
  otherDiscovery: "",
};
