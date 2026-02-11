"use client";

import { LogoMark } from "@/components/logo";

// Set to false to disable maintenance mode
const MAINTENANCE_MODE = true;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (MAINTENANCE_MODE) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md space-y-6">
          <div className="flex justify-center">
            <LogoMark size="lg" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">We&apos;ll be right back</h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Mosh is experiencing unusually high demand right now. We&apos;re scaling up our systems and will be back online shortly.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Working on it — check back soon
          </div>
        </div>
      </div>
    );
  }

  // Dynamic import to avoid loading Navigation during maintenance
  const { Navigation } = require("@/components/navigation");

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 lg:ml-0 mt-14 lg:mt-0">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
