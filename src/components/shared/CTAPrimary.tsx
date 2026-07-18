"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface CTAPrimaryProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
  size?: "default" | "sm";
}

export function CTAPrimary({
  href,
  children,
  className,
  icon = true,
  size = "default",
}: CTAPrimaryProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium",
        "bg-gradient-to-br from-[#0070ff] via-[var(--brand)] to-[#0050d4]",
        "text-white",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_20px_rgba(0,102,255,0.28)]",
        "transition-[transform,box-shadow,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_36px_rgba(0,102,255,0.42)] hover:brightness-110",
        "active:translate-y-0 active:scale-[0.98] active:brightness-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/25 before:via-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
        size === "sm" ? "px-5 py-2.5 text-[13px]" : "px-7 py-3.5 text-sm",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      {icon && (
        <ArrowRight className="relative z-10 size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}
