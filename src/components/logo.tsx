"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface MoshLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: 24, md: 30, lg: 40 }[size];
  const id = `logoGrad-${size}`;
  return (
    <svg
      width={dims}
      height={dims}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c5cfc" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      {/* Tilted gradient square with a circular cutout — bold, geometric, modern */}
      <rect x="6" y="6" width="24" height="24" rx="7" fill={`url(#${id})`} transform="rotate(12 18 18)" />
      <circle cx="18" cy="18" r="5.5" fill="var(--background, #0a0a0f)" />
    </svg>
  );
}

export function MoshLogo({ size = "md", showText = true, href = "/", className }: MoshLogoProps) {
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];

  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {showText && (
        <span className={cn("font-bold tracking-tight", textSize)}>
          mosh
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export { LogoMark };
