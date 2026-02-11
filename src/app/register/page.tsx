"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Sparkles, CheckCircle } from "lucide-react";
import { MoshLogo } from "@/components/logo";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12">
        <div className="w-full max-w-sm">
          <MoshLogo size="lg" />
          <h1 className="text-2xl font-bold mt-8 mb-2">Create your account</h1>
          <p className="text-sm text-[var(--muted-foreground)] mb-8">Start with 3 free tasks. No credit card required.</p>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:border-[var(--border-hover)] text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-[var(--muted)] border-t-[var(--foreground)] rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              size="lg"
            >
              <Sparkles className="w-4 h-4" />
              Create Account
            </Button>
          </form>

          <p className="text-sm text-[var(--muted)] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--accent)] hover:text-[var(--accent-light)] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Promo panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center" style={{ background: "linear-gradient(135deg, #7c5cfc 0%, #5b3cc4 50%, #3b1f8e 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 20%, rgba(192,132,252,0.3) 0%, transparent 50%)" }} />
        <div className="relative z-10 max-w-md px-12 text-white">
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Stop stressing.<br />Start calling.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Join thousands of expats, travelers, and remote workers who use Mosh to get things done abroad.
          </p>
          <div className="space-y-5">
            {[
              "Book restaurants, doctors, salons",
              "Dispute bills & cancel subscriptions",
              "Full transcript & English translation",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
                <span className="text-sm text-white/90 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
