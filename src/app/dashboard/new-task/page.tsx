"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/lib/country-context";
import {
  Send,
  AlertCircle,
  Phone,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";

// ─── SAVED PLACES ───
interface SavedPlace {
  id: string;
  name: string;
  phone: string;
  address?: string;
  category?: string;
  url?: string;
}

function getSavedPlaces(): SavedPlace[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("mosh-saved-places") || "[]");
  } catch { return []; }
}

function savePlace(place: SavedPlace) {
  const places = getSavedPlaces().filter((p) => p.id !== place.id);
  places.unshift(place);
  localStorage.setItem("mosh-saved-places", JSON.stringify(places.slice(0, 20)));
}

const EXAMPLES = [
  "Call my landlord and tell them the hot water stopped working",
  "Book a table for 2 at Sushi Saito this Friday at 7pm",
  "Ask NTT why my internet bill is ¥8,000 instead of ¥5,000",
  "Book a doctor appointment, I need a general checkup",
  "Call the school and ask about enrollment for my daughter",
  "Book a haircut at a salon near Shibuya for Saturday",
];

interface MissingField {
  key: string;
  question: string;
  required: boolean;
  type: "text" | "phone" | "email" | "select";
  options?: string[];
}

interface ParsedTask {
  summary: string;
  suggestedTaskType?: "call" | "email";
  businessName: string | null;
  phoneProvided: boolean;
  phone: string | null;
  category: string;
  details: {
    extracted: Record<string, string>;
    missing: MissingField[];
  };
  fallbackQuestion: string | null;
  fallbackOptions: string[];
}

type Step = "input" | "clarify";

export default function NewTaskPage() {
  const router = useRouter();
  const { selected: selectedCountry } = useCountry();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [step, setStep] = useState<Step>("input");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  // Fetch user name on mount
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => { if (d.name) setUserName(d.name); })
      .catch(() => {});
  }, []);

  // Step 1: parsing
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedTask | null>(null);

  // Step 2: clarification answers
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedFallback, setSelectedFallback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Rotating placeholder
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  useEffect(() => {
    if (step !== "input") return;
    setPlaceholderIdx(0);
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % EXAMPLES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [step]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.max(56, textareaRef.current.scrollHeight) + "px";
    }
  }, [message]);

  // Step 1: Send to GPT for parsing
  const handleParse = async () => {
    if (message.trim().length < 10) return;
    setParsing(true);
    setError("");
    try {
      const res = await fetch("/api/tasks/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: message,
          country: selectedCountry.name,
          taskType: "call",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to analyze task");
        setParsing(false);
        return;
      }
      setParsed(data);

      // Pre-fill answers from parsed data
      const prefill: Record<string, string> = {};
      if (data.phone) prefill.phone = data.phone;

      setAnswers(prefill);
      setStep("clarify");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setParsing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && message.trim().length > 10) {
      e.preventDefault();
      handleParse();
    }
  };

  // Check if all required fields are filled
  const phoneAnswer = answers.phone || parsed?.phone || "";
  const cleanedPhone = phoneAnswer.replace(/[\s\-()]/g, "");
  const isValidPhone = /^\+\d{7,15}$/.test(cleanedPhone) || /^\d{8,15}$/.test(cleanedPhone);
  const contactKeys = ['phone_number', 'phone', 'email', 'email_address', 'business_email', 'business_phone'];
  const requiredMissing = parsed?.details.missing.filter(
    (f) => f.required && !contactKeys.includes(f.key) && !answers[f.key]?.trim()
  ) || [];

  const canConfirm = isValidPhone && requiredMissing.length === 0;

  // Step 2: Create the call task + save place
  const handleConfirm = async () => {
    if (!parsed) return;

    setSubmitting(true);
    setError("");

    const bizName = answers.businessName || parsed.businessName || "Business";
    const bizPhone = phoneAnswer;

    // Build enriched description
    const extraDetails = Object.entries(answers)
      .filter(([k, v]) => k !== "phone" && k !== "businessName" && v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join(". ");
    const fallbackNote = selectedFallback ? `If not available: ${selectedFallback}.` : "";
    const fullDescription = [message, extraDetails, fallbackNote].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: fullDescription,
          businessName: bizName,
          phone: bizPhone,
          country: selectedCountry.key,
          priority: "normal",
          bookingName: userName || answers.name || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create task");
        setSubmitting(false);
        return;
      }

      // Auto-save this place for next time
      if (bizName !== "Business" && bizPhone) {
        savePlace({
          id: `${bizName}-${bizPhone}`.toLowerCase().replace(/\s+/g, "-"),
          name: bizName,
          phone: bizPhone,
          address: undefined,
          category: parsed.category || undefined,
        });
      }

      // Auto-trigger the call immediately after creating the task
      try {
        await fetch(`/api/tasks/${data.id}/call`, { method: "POST" });
      } catch (e) {
        console.error("Auto-call trigger failed:", e);
      }

      router.push(`/dashboard/call/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const categoryIcons: Record<string, string> = {
    medical: "🏥", restaurant: "🍣", maintenance: "🔧", government: "🏛️",
    finance: "🏦", delivery: "📦", salon: "✂️", school: "🏫",
    utility: "📞", other: "📋",
  };

  const quickTasks = [
    { icon: "🏥", title: "Book a doctor", prompt: "Book a doctor appointment for a general checkup. Preferably sometime this week." },
    { icon: "🍣", title: "Reserve a table", prompt: "Book a table for 2 this Friday at 7pm. Counter seats if possible." },
    { icon: "🔧", title: "Report a repair", prompt: "Call my landlord and tell them there's a broken pipe in the bathroom. Ask when they can send someone to fix it." },
    { icon: "✂️", title: "Book a haircut", prompt: "Book a haircut for this Saturday afternoon. Men's cut." },
    { icon: "📞", title: "Dispute a bill", prompt: "Call about my latest bill — the charge is higher than usual. Ask them to explain the difference." },
    { icon: "📦", title: "Track a delivery", prompt: "Call about my delivery — it was supposed to arrive yesterday but hasn't. Ask for an update." },
  ];

  // ─── STEP 1: INPUT ───
  if (step === "input") {
    return (
      <div className="max-w-2xl mx-auto px-4 flex flex-col" style={{ minHeight: "calc(100vh - 80px)" }}>
        {/* Header */}
        <div className="text-center pt-8 sm:pt-14 pb-6 sm:pb-10">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            What do you need <span className="gradient-text">Mosh</span> to do?
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-md mx-auto">
            Tell Mosh what you need in plain English — book a doctor, reserve a table, dispute a bill. Mosh will call the business in the local language and handle it for you.
          </p>
        </div>

        {/* Main input area */}
        <div className="flex-1 flex flex-col gap-5 min-h-0">
          <div className="space-y-4">
            {/* Freeform textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={EXAMPLES[placeholderIdx]}
              rows={3}
              className="w-full px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all resize-none leading-relaxed"
            />

            {/* Continue button */}
            <button
              onClick={handleParse}
              disabled={message.trim().length < 10 || parsing}
              className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                message.trim().length > 10
                  ? "bg-[var(--accent)] text-black hover:opacity-90 shadow-lg shadow-[var(--accent)]/20"
                  : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] cursor-not-allowed"
              }`}
            >
              {parsing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Continue
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Quick tasks — only when empty */}
          {!message && (
            <div className="pb-6">
              <p className="text-xs text-[var(--muted)] mb-3 text-center">or try one of these</p>
              <div className="grid grid-cols-3 gap-2">
                {quickTasks.map(({ icon, title, prompt }) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => { setMessage(prompt); textareaRef.current?.focus(); }}
                    className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all cursor-pointer group"
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="text-[11px] font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors text-center leading-tight">{title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center py-3">
          <p className="text-[10px] text-[var(--muted)]">1 credit per task</p>
        </div>
      </div>
    );
  }

  // ─── STEP 2: CLARIFY ───
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => { setStep("input"); setParsed(null); setAnswers({}); setError(""); setSelectedFallback(""); }}
        className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {parsed && (
        <div className="space-y-5">
          {/* Summary card */}
          <Card className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{categoryIcons[parsed.category] || "📋"}</span>
              <h2 className="text-base font-semibold flex-1">{parsed.summary}</h2>
            </div>

            {/* Extracted details as pills */}
            {Object.keys(parsed.details.extracted).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(parsed.details.extracted).map(([key, val]) => (
                  <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    {String(val)}
                  </span>
                ))}
              </div>
            )}

            {/* What user typed */}
            <p className="text-xs text-[var(--muted)] border-t border-[var(--border)] pt-3">&ldquo;{message}&rdquo;</p>
          </Card>

          {/* Follow-up questions */}
          <Card className="space-y-4">
            {/* Status message */}
            {parsed.phoneProvided && parsed.details.missing.filter(f => !contactKeys.includes(f.key)).length === 0 && !parsed.fallbackQuestion ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <p className="text-sm font-medium">Ready to go!</p>
              </div>
            ) : (
              <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">A few details</p>
            )}

            {/* Phone */}
            {!parsed.phoneProvided && (
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">Phone number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
                  <input type="tel" value={answers.phone || ""} onChange={(e) => setAnswers((p) => ({ ...p, phone: e.target.value }))} placeholder="+81 3-1234-5678"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all" />
                </div>
                {answers.phone && !isValidPhone && <p className="text-[10px] text-red-400 mt-0.5 px-0.5">Include + country code</p>}
              </div>
            )}

            {/* Dynamic fields from GPT */}
            {parsed.details.missing
              .filter((f) => !contactKeys.includes(f.key))
              .map((field) => (
              <div key={field.key}>
                <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">
                  {field.question} {field.required && <span className="text-red-400">*</span>}
                </label>
                {field.type === "select" && field.options ? (
                  <div className="flex flex-wrap gap-2">
                    {field.options.map((opt) => (
                      <button key={opt} type="button" onClick={() => setAnswers((p) => ({ ...p, [field.key]: opt }))}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          answers[field.key] === opt
                            ? "bg-[var(--accent)] text-black"
                            : "bg-[var(--background)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--accent)]/40"
                        }`}>{opt}</button>
                    ))}
                  </div>
                ) : (
                  <input type={field.type === "phone" ? "tel" : "text"} value={answers[field.key] || ""} onChange={(e) => setAnswers((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.type === "phone" ? "+81 3-1234-5678" : ""}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all" />
                )}
              </div>
            ))}

            {/* Fallback */}
            {parsed.fallbackQuestion && parsed.fallbackOptions.length > 0 && (
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">{parsed.fallbackQuestion}</label>
                <div className="flex flex-wrap gap-2">
                  {parsed.fallbackOptions.map((opt) => (
                    <button key={opt} type="button" onClick={() => setSelectedFallback(opt)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        selectedFallback === opt
                          ? "bg-[var(--accent)] text-black"
                          : "bg-[var(--background)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--accent)]/40"
                      }`}>{opt}</button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Your name — confirm before sending */}
          <Card className="space-y-3">
            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Booking under</p>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name (used for the booking)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all"
            />
          </Card>

          {/* Confirm */}
          <Button onClick={handleConfirm} loading={submitting} disabled={!canConfirm} size="lg" className="w-full">
            <Send className="w-4 h-4" /> Send Mosh <span className="text-xs opacity-60 ml-1">· 1 credit</span>
          </Button>

          {!canConfirm && (
            <p className="text-[10px] text-[var(--muted)] text-center">
              {!isValidPhone ? "Add a phone number with country code" : "Fill in required fields"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
