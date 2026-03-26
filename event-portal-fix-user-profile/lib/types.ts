export interface OnboardingStep {
  id: number;
  label: string;
}

export interface BasicInfoFormData {
  email: string;
  fullName: string;
  username: string;
  countryCode: string;
  phone: string;
}

export const STEPS: OnboardingStep[] = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Profile" },
  { id: 3, label: "Interests" },
  { id: 4, label: "Goals" },
  { id: 5, label: "Finish" },
];

export const COUNTRY_CODES = [
  { code: "+66", flag: "🇹🇭", country: "TH" },
  { code: "+1",  flag: "🇺🇸", country: "US" },
  { code: "+44", flag: "🇬🇧", country: "GB" },
  { code: "+61", flag: "🇦🇺", country: "AU" },
  { code: "+81", flag: "🇯🇵", country: "JP" },
  { code: "+49", flag: "🇩🇪", country: "DE" },
  { code: "+33", flag: "🇫🇷", country: "FR" },
  { code: "+65", flag: "🇸🇬", country: "SG" },
  { code: "+91", flag: "🇮🇳", country: "IN" },
  { code: "+86", flag: "🇨🇳", country: "CN" },
];