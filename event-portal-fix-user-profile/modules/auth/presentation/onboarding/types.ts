import { type Dispatch, type SetStateAction } from "react";

export type OnboardingFormState = {
  email: string;
  fullName: string;
  username: string;
  phoneCountryCode: string;
  phoneNumber: string;
  stage: string;
  interests: string[];
  otherInterest: string;
  goals: string[];
  programTypes: string[];
  budget: string;
  destinations: string[];
  joinedBefore: string;
  discoveryChannels: string[];
  otherDiscovery: string;
};

export type OnboardingStepMeta = {
  tag: string;
  title: string;
  subtitle: string;
};

export type OnboardingStepProps = {
  form: OnboardingFormState;
  setForm: Dispatch<SetStateAction<OnboardingFormState>>;
};
