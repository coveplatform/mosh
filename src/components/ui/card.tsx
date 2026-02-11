"use client";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export function Card({
  className,
  hover = false,
  glow = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] p-6",
        hover && "hover:bg-[var(--card-hover)] hover:border-[var(--border-hover)] cursor-pointer",
        glow && "glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
