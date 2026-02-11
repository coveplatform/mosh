"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MoshLogo } from "@/components/logo";
import { Users, Phone, TrendingUp, Clock } from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  credits: number;
  createdAt: string;
  _count: { callRequests: number };
}

interface Stats {
  totalUsers: number;
  usersToday: number;
  usersThisWeek: number;
  totalCalls: number;
  recentUsers: UserRow[];
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 403) {
          router.push("/dashboard");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load stats");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-[var(--muted)]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <MoshLogo size="sm" showText={false} href="/admin" />
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-xs text-[var(--muted-foreground)]">User signups and activity</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Total Users</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Today</span>
          </div>
          <p className="text-3xl font-bold">{stats.usersToday}</p>
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">This Week</span>
          </div>
          <p className="text-3xl font-bold">{stats.usersThisWeek}</p>
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Phone className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Total Calls</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalCalls}</p>
        </Card>
      </div>

      {/* Users table */}
      <Card className="overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold">Recent Signups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 font-medium">User</th>
                <th className="text-left px-4 py-2.5 font-medium">Plan</th>
                <th className="text-left px-4 py-2.5 font-medium">Credits</th>
                <th className="text-left px-4 py-2.5 font-medium">Calls</th>
                <th className="text-left px-4 py-2.5 font-medium">Signed Up</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card)]">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.plan === "free"
                        ? "bg-[var(--border)] text-[var(--muted-foreground)]"
                        : user.plan === "member"
                        ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{user.credits}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{user._count.callRequests}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
