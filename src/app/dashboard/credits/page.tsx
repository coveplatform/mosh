"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Coins,
  ArrowUp,
  ArrowDown,
  Plus,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface CreditData {
  credits: number;
  creditsMax: number;
  plan: string;
  transactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

export default function CreditsPage() {
  const [data, setData] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/credits")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[var(--card)] rounded-lg" />
        <div className="h-40 bg-[var(--card)] rounded-xl" />
      </div>
    );
  }

  const usagePercentage = data
    ? Math.round((data.credits / data.creditsMax) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Credits</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Manage your calling credits and view transaction history.
        </p>
      </div>

      {/* Credit Balance */}
      <Card glow className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)]/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Available Credits
            </p>
            <p className="text-5xl font-bold mt-2 gradient-text">
              {data?.credits ?? 0}
            </p>
            <p className="text-sm text-[var(--muted)] mt-1">
              of {data?.creditsMax ?? 0} monthly credits
            </p>

            {/* Progress bar */}
            <div className="w-64 h-2 bg-[var(--background)] rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/dashboard/plans">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4" />
                Get More Credits
              </Button>
            </Link>
            <Badge variant="accent" className="justify-center capitalize">
              {data?.plan ?? "free"} plan
            </Badge>
          </div>
        </div>
      </Card>

      {/* Credit Usage Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            credits: 1,
            label: "Simple Inquiry",
            desc: "Stock checks, hours, basic questions",
          },
          {
            credits: 2,
            label: "Booking",
            desc: "Reservations, appointments",
          },
          {
            credits: 3,
            label: "Complex",
            desc: "Negotiations, special requests",
          },
        ].map((tier) => (
          <Card key={tier.label} className="text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-[var(--accent)] font-bold">
                {tier.credits}
              </span>
            </div>
            <p className="text-sm font-medium">{tier.label}</p>
            <p className="text-xs text-[var(--muted)] mt-1">{tier.desc}</p>
          </Card>
        ))}
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        {data?.transactions && data.transactions.length > 0 ? (
          <div className="space-y-2">
            {data.transactions.map((tx) => (
              <Card key={tx.id} className="flex items-center gap-4 p-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.amount > 0
                      ? "bg-emerald-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  {tx.amount > 0 ? (
                    <ArrowUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant={
                        tx.type === "usage"
                          ? "warning"
                          : tx.type === "subscription"
                            ? "accent"
                            : "success"
                      }
                    >
                      {tx.type}
                    </Badge>
                    <span className="text-xs text-[var(--muted)]">
                      {formatDate(tx.createdAt)}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${
                    tx.amount > 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount}
                </span>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <Coins className="w-8 h-8 text-[var(--muted)] mx-auto mb-3" />
            <p className="text-[var(--muted-foreground)]">
              No transactions yet
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
