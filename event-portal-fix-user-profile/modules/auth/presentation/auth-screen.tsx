"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { Check, Eye, EyeOff, Mail, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { TextInput as BaseTextInput } from "@/components/ui/TextInput";
import { ROUTES } from "@/shared/constants/routes";
import { writeBackendAccessToken } from "@/shared/auth/backend-access-token.client";
import { getPasswordValidationState } from "@/shared/auth/password-validation";
import { getBackendBaseUrl } from "@/shared/config/data-mode";
import { LegalDocumentDialog } from "@/components/settings/privacy/dialogs/LegalDocumentDialog";

type AuthMode = "enterEmail" | "signIn" | "signUp";
type OverlayMode = "none" | "forgot" | "checkEmail" | "setPassword";
type CheckEmailFlow = "signUp" | "forgot";
type LegalModalType = "policy" | "terms";

type SignInFormState = {
  email: string;
  password: string;
};

type SignUpFormState = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
};

const initialSignIn: SignInFormState = {
  email: "",
  password: "",
};

const initialSignUp: SignUpFormState = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
};

function getGoogleAuthUrl() {
  if (typeof window !== "undefined") {
    const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalHost) {
      return "http://localhost:8080/api/v1/auth/google";
    }
  }

  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  const fallbackBaseUrl = "https://api.medalverse.ai";
  const baseUrl = (configuredBaseUrl ?? fallbackBaseUrl).replace(/\/$/, "");

  return `${baseUrl}/api/v1/auth/google`;
}

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("enterEmail");
  const [overlayMode, setOverlayMode] = useState<OverlayMode>("none");

  const [email, setEmail] = useState("");
  const [signInForm, setSignInForm] = useState<SignInFormState>(initialSignIn);
  const [signUpForm, setSignUpForm] = useState<SignUpFormState>(initialSignUp);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [checkEmailFlow, setCheckEmailFlow] = useState<CheckEmailFlow>("signUp");

  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType | null>(null);
  const [legalModalContent, setLegalModalContent] = useState("");
  const [legalModalLoading, setLegalModalLoading] = useState(false);
  const [legalModalError, setLegalModalError] = useState<string | null>(null);

  const passwordValidation = getPasswordValidationState(signUpForm.password, signUpForm.confirmPassword);
  const hasMinLength = passwordValidation.hasMinLength;
  const hasSpecialCharacter = passwordValidation.hasSpecial;
  const passwordsMatched = passwordValidation.matched;

  const otpComplete = useMemo(() => otp.every((digit) => digit.trim().length === 1), [otp]);

  async function onContinueWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${getBackendBaseUrl()}/api/v1/users/email?email=${encodeURIComponent(email)}`,
      );
      
      if (response.ok) {
        setSignInForm((prev) => ({ ...prev, email }));
        setMode("signIn");
      } else {
        setSignUpForm((prev) => ({ ...prev, email }));
        setMode("signUp");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/org/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signInForm.email,
          password: signInForm.password,
          rememberMe: true,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload.error === "string"
            ? payload.error
            : "Login failed.";
        setError(message);
        return;
      }

      const token = payload?.token || payload?.data?.backendAccessToken;
      if (typeof token === "string" && token) {
        writeBackendAccessToken(token);
      }

      router.replace("/events");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!hasMinLength || !hasSpecialCharacter || !passwordsMatched) {
      setError("Please complete password requirements before continuing.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signUpForm.email,
          password: signUpForm.password,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Registration failed.");
        return;
      }

      const token = payload?.data?.backendAccessToken;
      if (typeof token === "string" && token) {
        writeBackendAccessToken(token);
      }
      router.replace(`/welcome/info?email=${encodeURIComponent(signUpForm.email)}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function openLegalModal(type: LegalModalType) {
    const isThai = typeof window !== "undefined" && window.navigator.language.toLowerCase().startsWith("th");
    const pathByType: Record<LegalModalType, string> = {
      policy: isThai ? "/org/assets/legal/policy-th.txt" : "/org/assets/legal/policy-en.txt",
      terms: isThai ? "/org/assets/legal/terms-th.txt" : "/org/assets/legal/terms-en.txt",
    };

    setLegalModalType(type);
    setLegalModalLoading(true);
    setLegalModalError(null);
    setLegalModalContent("");

    fetch(pathByType[type], { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load document");
        }
        const text = await response.text();
        setLegalModalContent(text);
      })
      .catch(() => {
        setLegalModalError("Unable to load document content.");
      })
      .finally(() => {
        setLegalModalLoading(false);
      });
  }

  function onForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCheckEmailFlow("forgot");
    setOverlayMode("checkEmail");
  }

  async function onVerifyEmail() {
    setLoading(true);
    setError(null);

    const emailToVerify = signInForm.email || signUpForm.email;
    const code = otp.join("");

    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/v1/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToVerify,
          code,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        alert(payload.error ?? "Invalid verification code");
        return;
      }

      alert("Email verified successfully! You can now log in.");
      setOverlayMode("none");
      if (mode === "signUp") {
        setSignInForm((prev) => ({ ...prev, email: signUpForm.email }));
        setMode("signIn");
      }
    } catch {
      alert("Network error processing verification code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      <div className="relative z-10 flex min-h-dvh w-full flex-col">
        <div className="relative grid min-h-dvh w-full overflow-hidden lg:grid-cols-[42%_58%]">
          <Image
            src="/org/assets/images/Bg-login.png"
            alt="Login background"
            fill
            priority
            className="object-cover"
          />
        <section className="relative hidden overflow-hidden lg:block">
          <Image
            src="/org/assets/images/Bench.png"
            alt="Bench decoration"
            fill
            priority
            className="object-cover object-left-bottom"
          />
        </section>

        <section className="relative flex items-center justify-center px-5 py-5 sm:px-6 md:px-8 lg:px-12">
          <div className="w-full max-w-[540px]">
            {/* <button
              type="button"
              className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-900 md:mb-8"
            >
              <ArrowLeft size={14} />
              Back
            </button> */}

            <div className="mx-auto flex h-11 w-11 items-center justify-center">
              <img
                src="/org/assets/logos/medalverse-logo.svg?v=2"
                alt="Medalverse Logo"
                width={32}
                height={32}
                className="h-[32px] w-[32px]"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/medalverse-logo.svg";
                }}
              />
            </div>

            <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-800">
              {mode === "enterEmail"
                ? "Sign In or Join Now!"
                : mode === "signIn"
                  ? "Welcome Back"
                  : "Create your account"}
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500 md:mt-3 md:text-lg">
              {mode === "enterEmail"
                ? "Login or create your Medalverse account."
                : mode === "signIn"
                  ? "Sign in to access the Medalverse"
                  : "Sign up to access the Medalverse"}
            </p>

            <div className="mt-5 md:mt-6">
              {mode === "enterEmail" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = getGoogleAuthUrl();
                    }}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:h-12 md:text-base"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div className="my-5 flex items-center gap-3 md:my-6">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-semibold text-slate-400">OR</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <form className="space-y-3 md:space-y-4" onSubmit={onContinueWithEmail}>
                    <p className="text-xs text-slate-500 font-medium">Enter your email address to sign in or create an account</p>
                    <TextInput
                      id="emailInput"
                      type="email"
                      value={email}
                      onChange={(value) => setEmail(value)}
                      placeholder="user@medalvese.ai"
                    />

                    {error ? <ErrorText text={error} /> : null}

                    <button
                      type="submit"
                      disabled={loading || !email}
                      className="mt-2 h-11 w-full rounded-xl bg-[#23272f] text-base font-semibold text-white transition hover:bg-black disabled:opacity-60 md:mt-3 md:h-12 md:rounded-2xl md:text-lg"
                    >
                      {loading ? "Checking..." : "Continue with Email"}
                    </button>
                  </form>
                </>
              ) : mode === "signIn" ? (
                <form className="space-y-3 md:space-y-4" onSubmit={onSignIn}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="signInEmail" label="Email" />
                    <button type="button" onClick={() => setMode("enterEmail")} className="text-xs text-[#3C7ACB] hover:underline">Change</button>
                  </div>
                  <TextInput
                    id="signInEmail"
                    type="email"
                    value={signInForm.email}
                    onChange={(value) => setSignInForm((prev) => ({ ...prev, email: value }))}
                    placeholder="user@medalverse.ai"
                  />

                  <FieldLabel htmlFor="signInPassword" label="Password" />
                  <PasswordInput
                    id="signInPassword"
                    value={signInForm.password}
                    onChange={(value) => setSignInForm((prev) => ({ ...prev, password: value }))}
                    visible={showSignInPassword}
                    onToggleVisible={() => setShowSignInPassword((prev) => !prev)}
                    placeholder="Enter your password"
                  />

                  {error ? <ErrorText text={error} /> : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-base font-semibold text-white transition hover:from-black hover:to-slate-900 disabled:opacity-60 md:mt-3 md:h-12 md:rounded-2xl md:text-lg"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>

                  <button
                    type="button"
                    className="mx-auto block text-sm text-slate-500 underline decoration-slate-300 underline-offset-4"
                    onClick={() => setOverlayMode("forgot")}
                  >
                    Forgot Password?
                  </button>
                </form>
              ) : (
                <form className="space-y-3 md:space-y-4" onSubmit={onSignUp}>
                  <FieldLabel htmlFor="signUpEmail" label="Email" />
                  <TextInput
                    id="signUpEmail"
                    type="email"
                    value={signUpForm.email}
                    onChange={(value) => setSignUpForm((prev) => ({ ...prev, email: value }))}
                    placeholder="user@medalverse.ai"
                  />


                  <FieldLabel htmlFor="signUpPassword" label="Password" />
                  <PasswordInput
                    id="signUpPassword"
                    value={signUpForm.password}
                    onChange={(value) => setSignUpForm((prev) => ({ ...prev, password: value }))}
                    visible={showSignUpPassword}
                    onToggleVisible={() => setShowSignUpPassword((prev) => !prev)}
                    placeholder="Enter your password"
                  />

                  <FieldLabel htmlFor="confirmPassword" label="Confirm Password" />
                  <PasswordInput
                    id="confirmPassword"
                    value={signUpForm.confirmPassword}
                    onChange={(value) => setSignUpForm((prev) => ({ ...prev, confirmPassword: value }))}
                    visible={showConfirmPassword}
                    onToggleVisible={() => setShowConfirmPassword((prev) => !prev)}
                    placeholder="Confirm your password"
                  />

                  <RequirementRow done={hasMinLength} text="Must be at least 8 characters" />
                  <RequirementRow done={hasSpecialCharacter} text="Must contain one special character" />

                  {error ? <ErrorText text={error} /> : null}

                  <button
                    type="submit"
                    className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-base font-semibold text-white transition hover:from-black hover:to-slate-900 md:mt-3 md:h-12 md:rounded-2xl md:text-lg"
                  >
                    Sign Up
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSignInForm((prev) => ({ ...prev, email: signUpForm.email }));
                      setMode("signIn");
                    }}
                    className="mx-auto block pt-3 text-center text-md font-medium text-[#3C7ACB] hover:underline md:text-md"
                  >
                    Already have an account?
                  </button>
                </form>
              )}

              <p className="mt-5 text-xs text-slate-500 md:mt-6 md:text-sm">
                By clicking continue, you agree to our{" "}
                <button type="button" onClick={() => openLegalModal("terms")} className="text-[#3C7ACB] underline">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" onClick={() => openLegalModal("policy")} className="text-[#3C7ACB] underline">
                  Privacy Policy
                </button>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
      </div>

      {overlayMode !== "none" ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[1px]">
          <div className="relative max-h-[90dvh] w-full max-w-[460px] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl md:p-6">
            <button
              type="button"
              onClick={() => {
                setOverlayMode("none");
                setError(null);
                setVerifyLoading(false);
              }}
              className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-700"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {overlayMode === "forgot" ? (
              <form onSubmit={onForgotPassword} className="space-y-4">
                <CenterIcon icon={<Mail size={18} />} />
                <h3 className="text-center text-2xl font-semibold text-slate-800 md:text-3xl">Forgot password?</h3>
                <p className="text-center text-sm text-slate-500">
                  Enter your email address associated with your account, and we&apos;ll send you a link to reset your password.
                </p>
                <FieldLabel htmlFor="forgotEmail" label="Email" />
                <TextInput id="forgotEmail" type="email" value={signInForm.email} onChange={(value) => setSignInForm((prev) => ({ ...prev, email: value }))} />
                <button type="submit" className="h-12 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-sm font-semibold text-white">
                  Reset Password
                </button>
              </form>
            ) : null}

            {overlayMode === "checkEmail" ? (
              <div className="space-y-4">
                <CenterIcon icon={<Mail size={18} />} />
                <h3 className="text-center text-2xl font-semibold text-slate-800 md:text-3xl">Check your email</h3>
                <p className="text-center text-sm text-slate-500">We&apos;ve sent a 6-digit code to your email</p>
                <p className="text-center text-xs text-slate-400">Reference number: xxxxxx</p>

                <div className="grid grid-cols-6 gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      value={digit}
                      onChange={(event) => {
                        const next = event.target.value.replace(/\D/g, "").slice(-1);
                        setOtp((prev) => prev.map((v, i) => (i === index ? next : v)));
                      }}
                      className="h-11 rounded-xl border border-sky-300 bg-sky-50 text-center text-xl text-sky-600 outline-none ring-2 ring-transparent transition focus:ring-sky-300 md:h-12 md:text-2xl"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!otpComplete || verifyLoading}
                  // onClick={onVerifyOtp}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {verifyLoading ? "Verifying..." : "Verify"}
                </button>

                {error ? <ErrorText text={error} /> : null}

                <p className="text-center text-xs text-slate-400">
                  Didn&apos;t receive the email? <button type="button" className="text-blue-600">Resend Code</button>
                </p>
              </div>
            ) : null}

            {overlayMode === "setPassword" ? (
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setOverlayMode("none");
                }}
              >
                <CenterIcon icon={<Mail size={18} />} />
                <h3 className="text-center text-2xl font-semibold text-slate-800 md:text-3xl">Set new password</h3>
                <p className="text-center text-sm text-slate-500">Your new password must be different from previously used password.</p>

                <FieldLabel htmlFor="resetPassword" label="Password" />
                <PasswordInput
                  id="resetPassword"
                  value={signUpForm.password}
                  onChange={(value) => setSignUpForm((prev) => ({ ...prev, password: value }))}
                  visible={showSignUpPassword}
                  onToggleVisible={() => setShowSignUpPassword((prev) => !prev)}
                  placeholder="Enter your password"
                />

                <FieldLabel htmlFor="resetConfirmPassword" label="Confirm Password" />
                <PasswordInput
                  id="resetConfirmPassword"
                  value={signUpForm.confirmPassword}
                  onChange={(value) => setSignUpForm((prev) => ({ ...prev, confirmPassword: value }))}
                  visible={showConfirmPassword}
                  onToggleVisible={() => setShowConfirmPassword((prev) => !prev)}
                  placeholder="Confirm your password"
                />

                <RequirementRow done={hasMinLength} text="Must be at least 8 characters" />
                <RequirementRow done={hasSpecialCharacter} text="Must contain one special character" />

                <button type="submit" className="h-12 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-sm font-semibold text-white">
                  Reset Password
                </button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}

      {legalModalType ? (
        <LegalDocumentDialog
          title={legalModalType === "terms" ? "Terms of Service" : "Privacy Policy"}
          content={legalModalContent}
          loading={legalModalLoading}
          error={legalModalError}
          onClose={() => setLegalModalType(null)}
        />
      ) : null}
    </div>
  );
}

function FieldLabel({ label, htmlFor }: { label: string; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-slate-600 md:text-base">
      {label}
    </label>
  );
}

function TextInput({
  id,
  type,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  type: "email" | "text";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <BaseTextInput
      id={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 rounded-xl bg-white/90 px-3 text-base text-slate-800 placeholder:text-slate-400 focus:ring-sky-200 md:h-12 md:px-4 md:text-lg"
      required
    />
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  visible,
  onToggleVisible,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white/90 px-3 pr-10 text-base text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-sky-200 md:h-12 md:px-4 md:pr-12 md:text-lg"
        required
      />
      <button
        type="button"
        onClick={onToggleVisible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        aria-label="Toggle password visibility"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function RequirementRow({ done, text }: { done: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 md:text-base">
      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${done ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-200"}`}>
        <Check size={12} />
      </span>
      {text}
    </div>
  );
}

function CenterIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-sky-300 bg-sky-50 text-sky-500">
      {icon}
    </div>
  );
}

function ErrorText({ text }: { text: string }) {
  return <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{text}</p>;
}
