"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: "green" | "red" | "amber" | "none";
}

export default function Card({ children, className = "", glow = "none" }: CardProps) {
  const glowMap = {
    green: "shadow-[0_0_20px_rgba(0,255,136,0.1)]",
    red: "shadow-[0_0_20px_rgba(255,59,59,0.1)]",
    amber: "shadow-[0_0_20px_rgba(245,158,11,0.1)]",
    none: "",
  };

  return (
    <div
      className={`bg-[#0d1117]/80 backdrop-blur-md border border-[#00ff88]/20 rounded-sm ${glowMap[glow]} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-3 border-b border-border ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
