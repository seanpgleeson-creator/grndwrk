"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon" | "icon-sm";
  loading?: boolean;
}

const variantStyles = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)] " +
    "hover:bg-[color-mix(in_srgb,var(--accent)_88%,transparent)] hover:border-transparent",
  secondary:
    "bg-[var(--bg-elev)] text-[var(--ink)] border-[var(--line)] " +
    "hover:border-[var(--ink-4)] hover:bg-[var(--bg-sub)]",
  ghost:
    "bg-transparent text-[var(--ink-2)] border-transparent " +
    "hover:bg-[var(--bg-mute)] hover:text-[var(--ink)]",
  danger:
    "bg-transparent text-[var(--ink)] border-[var(--line)] " +
    "hover:bg-[var(--bg-mute)] hover:text-red-600",
};

const sizeStyles = {
  sm:      "h-[30px] px-[10px] text-[12.5px] rounded-[6px]",
  md:      "h-[var(--field-h)] px-4 text-[13px] rounded-[var(--radius)]",
  icon:    "h-[var(--field-h)] w-[var(--field-h)] px-0 rounded-[var(--radius)]",
  "icon-sm": "h-[30px] w-[30px] px-0 rounded-[6px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 border font-medium",
          "whitespace-nowrap transition-all duration-[120ms] ease-[ease]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus)_18%,transparent)]",
          "tracking-[-0.005em]",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
