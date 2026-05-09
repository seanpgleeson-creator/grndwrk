import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-[var(--ink)] tracking-[-0.005em]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-[var(--field-h)] rounded-[var(--radius)] border bg-[var(--bg-elev)]",
            "border-[var(--line)] px-3 text-[14px] text-[var(--ink)]",
            "placeholder:text-[var(--ink-4)]",
            "outline-none transition-[border-color,box-shadow,background] duration-[120ms] ease-[ease]",
            "hover:border-[var(--ink-4)]",
            "focus:border-[var(--focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus)_12%,transparent)]",
            "disabled:opacity-50",
            error && "border-red-500/60 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]",
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-[12px] text-[var(--ink-3)] leading-[1.45]">{hint}</p>}
        {error && <p className="text-[12px] text-red-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
