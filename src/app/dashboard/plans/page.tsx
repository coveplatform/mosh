"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap, ExternalLink, CheckCircle } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Explorer",
    price: 0,
    period: "forever",
    credits: 3,
    icon: Zap,
    description: "Try Mosh with a few free tasks",
    features: [
      "3 tasks per month",
      "Calls only",
      "3 countries (Japan, France, Spain)",
      "Basic summaries",
      "Email support",
    ],
    cta: "Current Plan",
    popular: false,
  },
  {
    id: "member",
    name: "Member",
    price: 19,
    period: "/month",
    credits: 15,
    icon: Sparkles,
    description: "For expats handling life admin",
    features: [
      "15 tasks per month",
      "Phone calls in 10+ languages",
      "All 10+ countries",
      "Detailed transcripts & action items",
      "Cultural briefings",
      "Priority queue",
      "Chat support",
    ],
    cta: "Upgrade to Member",
    popular: true,
  },
  {
    id: "global",
    name: "Global",
    price: 79,
    period: "/month",
    credits: 50,
    icon: Crown,
    description: "For teams & power users",
    features: [
      "50 tasks per month",
      "Phone calls in 10+ languages",
      "All 10+ countries",
      "Detailed transcripts & action items",
      "Cultural briefings",
      "Priority queue",
      "Recurring tasks",
      "Up to 3 household members",
      "Dedicated support",
    ],
    cta: "Upgrade to Global",
    popular: false,
  },
];

function PlansPageInner() {
  const searchParams = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for success/cancel from Stripe redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const plan = searchParams.get("plan");
      setSuccessMessage(
        `Welcome to ${plan === "global" ? "Global" : "Member"}! Your credits have been refreshed.`
      );
      // Refresh user data
      fetch("/api/user/me")
        .then((r) => r.json())
        .then((data) => {
          if (data.plan) setCurrentPlan(data.plan);
        })
        .catch(() => {});
    }
    if (searchParams.get("canceled") === "true") {
      setError("Checkout was cancelled. No charges were made.");
    }
  }, [searchParams]);

  // Fetch current user plan
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.plan) setCurrentPlan(data.plan);
      })
      .catch(() => {});
  }, []);

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") return;

    setLoading(planId);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start checkout");
        setLoading(null);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to open billing portal");
        setPortalLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight">
          Choose Your <span className="gradient-text">Plan</span>
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Unlock more credits and premium features. Cancel anytime.
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="max-w-md mx-auto flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-sm text-green-400">{successMessage}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="max-w-md mx-auto flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-[var(--accent)]/40 glow-strong"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="accent" className="px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                    plan.popular
                      ? "bg-[var(--accent)]/20"
                      : "bg-[var(--card-hover)]"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      plan.popular
                        ? "text-[var(--accent)]"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-[var(--muted)]">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--accent)] mt-1">
                  {plan.credits} credits/month
                </p>
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                variant={
                  isCurrent ? "secondary" : plan.popular ? "primary" : "outline"
                }
                className="w-full"
                disabled={isCurrent || loading === plan.id}
                loading={loading === plan.id}
                onClick={() => handleUpgrade(plan.id)}
              >
                {isCurrent ? "Current Plan" : plan.cta}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Manage subscription */}
      {currentPlan !== "free" && (
        <div className="text-center">
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {portalLoading ? "Opening..." : "Manage subscription & billing"}
          </button>
        </div>
      )}

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-12">
        <h2 className="text-lg font-semibold text-center mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "What happens if I run out of credits?",
              a: "You can upgrade your plan for more credits. Credits refresh at the start of each billing cycle.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. Cancel anytime from the billing portal. You'll keep your credits until the end of the billing period.",
            },
            {
              q: "What countries do you support?",
              a: "Currently: Japan, South Korea, China, France, Italy, Spain, Germany, Thailand, Australia, UK, and USA.",
            },
            {
              q: "How fast are calls executed?",
              a: "Calls are initiated immediately after you confirm. Mosh dials the business right away.",
            },
          ].map((faq) => (
            <Card key={faq.q} className="p-4">
              <p className="text-sm font-medium">{faq.q}</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {faq.a}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-[var(--muted)]">Loading plans...</div></div>}>
      <PlansPageInner />
    </Suspense>
  );
}
