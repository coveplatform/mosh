"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Phone, Search, Filter, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CallRecord {
  id: string;
  businessName: string;
  businessPhone: string;
  country: string;
  language: string;
  status: string;
  tier: string;
  objective: string;
  summary?: string;
  outcome?: string;
  creditsUsed: number;
  createdAt: string;
  completedAt?: string;
}

export default function HistoryPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/calls")
      .then((res) => res.json())
      .then((data) => {
        setCalls(data.calls || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = calls.filter((call) => {
    const matchesSearch =
      call.businessName.toLowerCase().includes(search.toLowerCase()) ||
      call.country.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || call.status === filter;
    return matchesSearch && matchesFilter;
  });

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
  ];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[var(--card)] rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[var(--card)] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Task History</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          All your past and active tasks.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <Input
            placeholder="Search by business or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((sf) => (
            <Button
              key={sf.value}
              variant={filter === sf.value ? "primary" : "secondary"}
              size="sm"
              onClick={() => setFilter(sf.value)}
            >
              {sf.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Call List */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((call) => (
            <Link key={call.id} href={`/dashboard/call/${call.id}`}>
              <Card hover className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--card-hover)] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[var(--muted-foreground)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {call.businessName}
                    </p>
                    <Badge
                      variant={
                        call.status === "completed"
                          ? "success"
                          : call.status === "failed"
                            ? "error"
                            : call.status === "in_progress"
                              ? "accent"
                              : "warning"
                      }
                    >
                      {call.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--muted)]">
                      {call.country}
                    </span>
                    <span className="text-xs text-[var(--muted)]">·</span>
                    <span className="text-xs text-[var(--muted)]">
                      {call.tier}
                    </span>
                    <span className="text-xs text-[var(--muted)]">·</span>
                    <span className="text-xs text-[var(--muted)]">
                      {call.creditsUsed} credit{call.creditsUsed > 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-[var(--muted)]">·</span>
                    <span className="text-xs text-[var(--muted)]">
                      {formatDate(call.createdAt)}
                    </span>
                  </div>
                  {call.summary && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 truncate">
                      {call.summary}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--muted)] shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Phone className="w-8 h-8 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-[var(--muted-foreground)]">
            {search || filter !== "all"
              ? "No tasks match your search"
              : "No tasks yet"}
          </p>
          <Link href="/dashboard/new-task" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              Create Your First Task
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
