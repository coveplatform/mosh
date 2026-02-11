"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Phone,
  History,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Coins,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { CountrySelector } from "./country-selector";
import { MoshLogo } from "./logo";

const navItems = [
  { href: "/dashboard", label: "Tasks", icon: LayoutDashboard },
  { href: "/dashboard/new-task", label: "New Task", icon: Phone },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/credits", label: "Credits", icon: Coins },
  { href: "/dashboard/plans", label: "Plans", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-[var(--border)] bg-[var(--background)]">
        <div className="p-6 border-b border-[var(--border)]">
          <MoshLogo size="md" />
        </div>

        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] px-3 mb-2">Living in</p>
          <CountrySelector userPlan="global" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] text-xs font-bold">
              {session?.user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || "Guest"}
              </p>
              <p className="text-xs text-[var(--muted)] truncate">
                {session?.user?.email || ""}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass">
        <div className="flex items-center justify-between px-4 py-3">
          <MoshLogo size="sm" />
          <div className="flex items-center gap-2">
            <CountrySelector compact userPlan="global" />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-[var(--card)] cursor-pointer"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="px-4 pb-4 space-y-1 border-t border-[var(--border)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                    isActive
                      ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                      : "text-[var(--muted-foreground)]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 w-full cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        )}
      </header>
    </>
  );
}
