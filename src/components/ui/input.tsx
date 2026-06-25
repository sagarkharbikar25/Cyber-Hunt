"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mono?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, mono, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs text-text3 mb-1.5 uppercase tracking-wider font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-surface border ${
            error ? "border-red" : "border-border"
          } rounded-lg px-4 py-2.5 text-sm text-text placeholder:text-text3 focus:outline-none focus:border-accent/50 transition-colors ${
            mono ? "font-mono" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-red text-xs mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
