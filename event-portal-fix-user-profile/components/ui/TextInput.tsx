import { forwardRef, InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className = "", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-emerald-200 transition focus:ring-2 ${className}`.trim()}
      {...props}
    />
  );
});
