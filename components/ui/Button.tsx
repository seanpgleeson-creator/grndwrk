"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles = {
  primary: "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white border-transparent",
  secondary: "bg-[var(--surface-raised)] hover:bg-[var(--border)] text-[var(--foreground)] border-[var(--border)]",
  ghost: "bg-transparent hover:bg-[var(--surface-raised)] text-[var(--muted)] hover:text-[var(--foreground)] border-transparent",
  danger: "bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 text-[var(--danger)] border-[var(--danger)]/30",
};

const sizeStyles = {
  sm: "px-3 py-2 text-xs min-h-[36px]",
  md: "px-4 py-2.5 text-sm min-h-[44px]",
  lg: "px-5 py-3 text-base min-h-[48px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-colors duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
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
