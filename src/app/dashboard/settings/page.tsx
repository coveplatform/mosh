"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  Mail,
  CreditCard,
  Save,
  CheckCircle,
  MapPin,
  Trash2,
  ExternalLink,
  Sparkles,
  Crown,
  Zap,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  replyToEmail: string | null;
  plan: string;
  credits: number;
  creditsMax: number;
  stripeSubscriptionId: string | null;
}

interface SavedPlace {
  name: string;
  phone: string;
  country: string;
}

const planLabels: Record<string, { name: string; icon: typeof Zap; color: string }> = {
  free: { name: "Explorer", icon: Zap, color: "text-[var(--muted-foreground)]" },
  member: { name: "Member", icon: Sparkles, color: "text-[var(--accent)]" },
  global: { name: "Global", icon: Crown, color: "text-amber-400" },
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");

  // Saved places from localStorage
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);

  // Fetch user data
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setUser(data);
          setName(data.name || "");
          setReplyToEmail(data.replyToEmail || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load saved places from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mosh-saved-places");
      if (stored) setSavedPlaces(JSON.parse(stored));
    } catch {}
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, replyToEmail: replyToEmail || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        setUser((prev) => (prev ? { ...prev, name: data.name, replyToEmail: data.replyToEmail } : prev));
        setSuccess("Settings saved!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const removeSavedPlace = (index: number) => {
    const updated = savedPlaces.filter((_, i) => i !== index);
    setSavedPlaces(updated);
    localStorage.setItem("mosh-saved-places", JSON.stringify(updated));
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const planInfo = planLabels[user?.plan || "free"] || planLabels.free;
  const PlanIcon = planInfo.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Manage your account, email preferences, and subscription.
        </p>
      </div>

      {/* Success / Error messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <User className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-medium">Profile</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] text-xl font-bold">
              {name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="font-medium">{name || "User"}</p>
              <p className="text-sm text-[var(--muted)]">{user?.email}</p>
            </div>
          </div>
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input label="Account Email" value={user?.email || ""} disabled />
        </div>
      </Card>

      {/* Email Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-medium">Email Settings</h3>
        </div>
        <div className="space-y-4">
          <Input
            label="Reply-to Email"
            placeholder="your-email@example.com"
            value={replyToEmail}
            onChange={(e) => setReplyToEmail(e.target.value)}
          />
          <p className="text-xs text-[var(--muted)]">
            When Mosh sends emails on your behalf, replies from the business will go to this address.
            If left blank, replies go to your account email ({user?.email}).
          </p>
        </div>
      </Card>

      {/* Save button */}
      <Button onClick={handleSave} loading={saving} size="sm">
        <Save className="w-4 h-4" />
        Save Changes
      </Button>

      {/* Subscription */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-medium">Subscription</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--background)]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user?.plan === "free" ? "bg-[var(--card-hover)]" : "bg-[var(--accent)]/10"}`}>
                <PlanIcon className={`w-5 h-5 ${planInfo.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold">{planInfo.name} Plan</p>
                <p className="text-xs text-[var(--muted)]">
                  {user?.credits}/{user?.creditsMax} credits remaining
                </p>
              </div>
            </div>
            <Badge variant={user?.plan === "free" ? "default" : "accent"}>
              {user?.plan === "free" ? "Free" : "Active"}
            </Badge>
          </div>

          <div className="flex gap-2">
            {user?.plan === "free" ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => (window.location.href = "/dashboard/plans")}
              >
                <Sparkles className="w-4 h-4" />
                Upgrade Plan
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={handleManageBilling}>
                <ExternalLink className="w-4 h-4" />
                Manage Billing
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Saved Places */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-medium">Saved Places</h3>
        </div>
        {savedPlaces.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No saved places yet. When you create tasks, businesses you contact will appear here for quick access.
          </p>
        ) : (
          <div className="space-y-2">
            {savedPlaces.map((place, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)]"
              >
                <div>
                  <p className="text-sm font-medium">{place.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {place.phone} &middot; {place.country}
                  </p>
                </div>
                <button
                  onClick={() => removeSavedPlace(i)}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Security */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-medium">Security</h3>
        </div>
        <div className="space-y-4">
          <Button variant="secondary" size="sm">
            Change Password
          </Button>
          <div className="border-t border-[var(--border)] pt-4">
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
            <p className="text-xs text-[var(--muted)] mt-2">
              This action is irreversible. All data will be permanently deleted.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
