"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-bold rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-widest font-mono";

    const variants = {
      primary: "bg-bg border border-accent text-accent hover:bg-accent hover:text-bg hover:shadow-[0_0_12px_#00ff88]",
      secondary: "bg-surface border border-border2 text-text2 hover:border-accent hover:text-accent hover:shadow-[0_0_8px_rgba(0,255,136,0.3)]",
      danger: "bg-bg border border-red text-red hover:bg-red hover:text-white hover:shadow-[0_0_12px_#ff3c3c]",
      ghost: "bg-transparent text-text2 hover:text-accent hover:bg-accent/5",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-8 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
