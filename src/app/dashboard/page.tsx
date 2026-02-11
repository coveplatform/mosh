"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Plus,
  Coins,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Phone,
  ArrowRight,
  ChevronRight,
  X,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useCountry } from "@/lib/country-context";

interface Task {
  id: string;
  businessName: string;
  country: string;
  status: string;
  outcome?: string;
  summary?: string;
  actionItems?: string;
  objective: string;
  createdAt: string;
  completedAt?: string;
}

interface DashboardData {
  user: {
    name: string;
    credits: number;
    creditsMax: number;
    plan: string;
  };
  recentCalls: Task[];
  stats: {
    totalCalls: number;
    completedCalls: number;
    countriesCalled: number;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { selected: selectedCountry } = useCountry();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchData = () => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirmId !== id) {
      setConfirmId(id);
      setTimeout(() => setConfirmId((prev) => (prev === id ? null : prev)), 3000);
      return;
    }

    setDeletingId(id);
    setConfirmId(null);
    try {
      const res = await fetch(`/api/calls/${id}`, { method: "DELETE" });
      if (res.ok) {
        const result = await res.json();
        // Remove from local state immediately
        if (data) {
          setData({
            ...data,
            recentCalls: data.recentCalls.filter((t) => t.id !== id),
            // Refresh credits if refunded
            user: result.refunded
              ? { ...data.user, credits: data.user.credits + 1 }
              : data.user,
          });
        }
      }
    } catch {
      // silent fail
    }
    setDeletingId(null);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Group tasks by status
  const active = data?.recentCalls?.filter(
    (t) => t.status === "in_progress"
  ) || [];
  const queued = data?.recentCalls?.filter(
    (t) => t.status === "pending"
  ) || [];
  const needsAttention = data?.recentCalls?.filter(
    (t) =>
      t.outcome === "callback_needed" ||
      t.outcome === "partial" ||
      t.status === "failed"
  ) || [];
  const completed = data?.recentCalls?.filter(
    (t) => t.status === "completed" && t.outcome !== "callback_needed" && t.outcome !== "partial"
  ) || [];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-[var(--card)] rounded-lg" />
        <div className="h-20 bg-[var(--card)] rounded-xl" />
        <div className="h-40 bg-[var(--card)] rounded-xl" />
      </div>
    );
  }

  const hasAnyTasks = (data?.recentCalls?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()},{" "}
            <span className="gradient-text">
              {session?.user?.name?.split(" ")[0] || "there"}
            </span>
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {hasAnyTasks
              ? `You have ${active.length + queued.length} active task${active.length + queued.length !== 1 ? "s" : ""}.`
              : "Your personal concierge is ready."}
          </p>
        </div>
        <Link href="/dashboard/new-task">
          <Button variant="primary">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Credits bar */}
      <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <Coins className="w-4 h-4 text-[var(--accent)]" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--muted-foreground)]">Credits</span>
            <span className="text-xs font-medium">
              {data?.user.credits ?? 0} / {data?.user.creditsMax ?? 0}
            </span>
          </div>
          <div className="h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all"
              style={{
                width: `${Math.min(100, ((data?.user.credits ?? 0) / Math.max(1, data?.user.creditsMax ?? 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
        <Link href="/dashboard/plans">
          <Button variant="ghost" size="sm" className="text-xs">
            Upgrade
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {!hasAnyTasks && (
        <Card className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="w-7 h-7 text-[var(--accent)]" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Create your first task</h3>
          <p className="text-sm text-[var(--muted-foreground)] max-w-sm mx-auto">
            Tell Mosh what you need — call a landlord, book a doctor, reserve a restaurant — and your AI concierge will handle it.
          </p>
          <Link href="/dashboard/new-task" className="mt-6 inline-block">
            <Button>
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </Link>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto text-left">
            {[
              { icon: "🔧", text: "Call landlord about a broken pipe" },
              { icon: "🏥", text: "Book a doctor who speaks English" },
              { icon: "🍣", text: "Reserve a sushi counter for Friday" },
              { icon: "📞", text: "Dispute an internet bill charge" },
            ].map((ex) => (
              <div
                key={ex.text}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[var(--border)] text-xs text-[var(--muted-foreground)]"
              >
                <span>{ex.icon}</span>
                {ex.text}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active / Calling */}
      {active.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-400">Active</h2>
          </div>
          <div className="space-y-2">
            {active.map((task) => (
              <div key={task.id} className="group relative">
                <Link href={`/dashboard/call/${task.id}`}>
                  <Card hover className="flex items-center gap-4 p-4 border-blue-500/20">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.businessName}</p>
                      <p className="text-xs text-blue-400 mt-0.5">Calling now...</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
                  </Card>
                </Link>
                <button
                  onClick={(e) => handleDelete(task.id, e)}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all cursor-pointer z-10 ${
                    confirmId === task.id
                      ? "bg-red-500/20 opacity-100"
                      : "opacity-0 group-hover:opacity-100 hover:bg-[var(--background)]"
                  }`}
                >
                  {deletingId === task.id ? (
                    <Loader2 className="w-3.5 h-3.5 text-[var(--muted)] animate-spin" />
                  ) : confirmId === task.id ? (
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[var(--muted)]" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Queued */}
      {queued.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400">Queued</h2>
          </div>
          <div className="space-y-2">
            {queued.map((task) => (
              <div key={task.id} className="group relative">
                <Link href={`/dashboard/call/${task.id}`}>
                  <Card hover className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.businessName}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{task.objective.slice(0, 80)}...</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
                  </Card>
                </Link>
                <button
                  onClick={(e) => handleDelete(task.id, e)}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all cursor-pointer z-10 ${
                    confirmId === task.id
                      ? "bg-red-500/20 opacity-100"
                      : "opacity-0 group-hover:opacity-100 hover:bg-[var(--background)]"
                  }`}
                >
                  {deletingId === task.id ? (
                    <Loader2 className="w-3.5 h-3.5 text-[var(--muted)] animate-spin" />
                  ) : confirmId === task.id ? (
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[var(--muted)]" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-400">Needs Attention</h2>
          </div>
          <div className="space-y-2">
            {needsAttention.map((task) => (
              <div key={task.id} className="group relative">
                <Link href={`/dashboard/call/${task.id}`}>
                  <Card hover className="flex items-center gap-4 p-4 border-orange-500/20">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.businessName}</p>
                      <p className="text-xs text-orange-400 mt-0.5">
                        {task.outcome === "callback_needed"
                          ? "Callback needed"
                          : task.outcome === "partial"
                          ? "Partially completed — review needed"
                          : "Failed — retry available"}
                      </p>
                      {task.actionItems && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1 truncate">
                          {task.actionItems}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
                  </Card>
                </Link>
                <button
                  onClick={(e) => handleDelete(task.id, e)}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all cursor-pointer z-10 ${
                    confirmId === task.id
                      ? "bg-red-500/20 opacity-100"
                      : "opacity-0 group-hover:opacity-100 hover:bg-[var(--background)]"
                  }`}
                >
                  {deletingId === task.id ? (
                    <Loader2 className="w-3.5 h-3.5 text-[var(--muted)] animate-spin" />
                  ) : confirmId === task.id ? (
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[var(--muted)]" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Completed</h2>
            </div>
            <Link href="/dashboard/history" className="text-xs text-[var(--muted)] hover:text-[var(--muted-foreground)]">
              View all <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
          <div className="space-y-2">
            {completed.map((task) => (
              <div key={task.id} className="group relative">
                <Link href={`/dashboard/call/${task.id}`}>
                  <Card hover className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.businessName}</p>
                      {task.summary ? (
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">{task.summary}</p>
                      ) : (
                        <p className="text-xs text-[var(--muted)] mt-0.5">{formatDate(task.completedAt || task.createdAt)}</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
                  </Card>
                </Link>
                <button
                  onClick={(e) => handleDelete(task.id, e)}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all cursor-pointer z-10 ${
                    confirmId === task.id
                      ? "bg-red-500/20 opacity-100"
                      : "opacity-0 group-hover:opacity-100 hover:bg-[var(--background)]"
                  }`}
                >
                  {deletingId === task.id ? (
                    <Loader2 className="w-3.5 h-3.5 text-[var(--muted)] animate-spin" />
                  ) : confirmId === task.id ? (
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-[var(--muted)]" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
