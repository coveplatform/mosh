"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCountry } from "@/lib/country-context";
import {
  Send,
  AlertCircle,
  Phone,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Link2,
  X,
  Star,
  MapPin,
  Clock,
  Bookmark,
  Mail,
  FileText,
  Eye,
  Settings,
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

function removePlace(id: string) {
  const places = getSavedPlaces().filter((p) => p.id !== id);
  localStorage.setItem("mosh-saved-places", JSON.stringify(places));
}

// ─── URL EXTRACTION ───
interface ExtractedBiz {
  name: string | null;
  phone: string | null;
  address: string | null;
  category: string;
  image: string | null;
  hours: string | null;
  url: string;
}

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;

const CALL_EXAMPLES = [
  "Call my landlord and tell them the hot water stopped working",
  "Book a table for 2 at Sushi Saito this Friday at 7pm",
  "Ask NTT why my internet bill is ¥8,000 instead of ¥5,000",
  "Book a doctor appointment, I need a general checkup",
  "Call the school and ask about enrollment for my daughter",
  "Book a haircut at a salon near Shibuya for Saturday",
  "Ask my bank about the ¥3,000 fee on my last statement",
  "Call the gas company — I smell gas near the kitchen stove",
  "Reserve a private room for 6 at an izakaya in Shinjuku",
  "Track my delivery from Yamato — tracking number 1234-5678",
];

const EMAIL_EXAMPLES = [
  "Email the hotel to confirm my booking dates",
  "Send a formal complaint about my internet service",
  "Ask the school about enrollment requirements for next semester",
  "Email the embassy about visa appointment availability",
  "Request a refund for a cancelled reservation",
  "Inquire about apartment rental availability and pricing",
  "Email the clinic to request my medical records",
  "Ask the university about their international student program",
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
  emailProvided?: boolean;
  email?: string | null;
  category: string;
  details: {
    extracted: Record<string, string>;
    missing: MissingField[];
  };
  fallbackQuestion: string | null;
  fallbackOptions: string[];
}

type Step = "input" | "clarify" | "email-review";
type TaskType = "call" | "email";

export default function NewTaskPage() {
  const router = useRouter();
  const { selected: selectedCountry } = useCountry();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [step, setStep] = useState<Step>("input");
  const [taskType, setTaskType] = useState<TaskType>("call");
  const [userChoseTaskType, setUserChoseTaskType] = useState(false);
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

  // URL extraction
  const [extractedBiz, setExtractedBiz] = useState<ExtractedBiz | null>(null);
  const [extractingUrl, setExtractingUrl] = useState(false);
  const [lastExtractedUrl, setLastExtractedUrl] = useState("");
  const [linkInput, setLinkInput] = useState("");

  // Saved places
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SavedPlace | null>(null);

  // Step 1: parsing
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedTask | null>(null);

  // Step 2: clarification answers
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedFallback, setSelectedFallback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Email draft state
  const [emailDraft, setEmailDraft] = useState<{ subject: string; body: string; subjectEnglish: string; bodyEnglish: string } | null>(null);
  const [draftingEmail, setDraftingEmail] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  // Load saved places
  useEffect(() => {
    setSavedPlaces(getSavedPlaces());
  }, []);

  // Email input for step 1
  const [emailInput, setEmailInput] = useState("");

  // Rotating placeholder
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const examples = taskType === "email" ? EMAIL_EXAMPLES : CALL_EXAMPLES;
  useEffect(() => {
    if (step !== "input") return;
    setPlaceholderIdx(0);
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % (taskType === "email" ? EMAIL_EXAMPLES.length : CALL_EXAMPLES.length));
    }, 3500);
    return () => clearInterval(interval);
  }, [step, taskType]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.max(56, textareaRef.current.scrollHeight) + "px";
    }
  }, [message]);

  // Detect URLs in message and auto-extract
  const extractUrl = useCallback(async (url: string) => {
    if (extractingUrl || url === lastExtractedUrl) return;
    setExtractingUrl(true);
    setLastExtractedUrl(url);
    try {
      const res = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const data: ExtractedBiz = await res.json();
        setExtractedBiz(data);
      }
    } catch {
      // silent fail
    }
    setExtractingUrl(false);
  }, [extractingUrl, lastExtractedUrl]);

  // URL detection removed from message — now handled by dedicated linkInput field

  const language =
    selectedCountry.name === "United States" ||
    selectedCountry.name === "United Kingdom" ||
    selectedCountry.name === "Australia"
      ? "English"
      : "the local language";

  // Apply a saved place
  const applyPlace = (place: SavedPlace) => {
    setSelectedPlace(place);
    setExtractedBiz({
      name: place.name,
      phone: place.phone,
      address: place.address || null,
      category: place.category || "other",
      image: null,
      hours: null,
      url: place.url || "",
    });
    textareaRef.current?.focus();
  };

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
          taskType: userChoseTaskType ? taskType : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to analyze task");
        setParsing(false);
        return;
      }
      setParsed(data);

      // Auto-set task type from GPT suggestion ONLY if user hasn't explicitly toggled
      if (data.suggestedTaskType && !userChoseTaskType) {
        setTaskType(data.suggestedTaskType);
      }

      // Pre-fill from extracted URL or saved place
      const biz = extractedBiz;
      const prefill: Record<string, string> = {};
      if (biz?.phone) prefill.phone = biz.phone;
      if (biz?.name) prefill.businessName = biz.name;
      if (data.phone) prefill.phone = data.phone;
      if (data.email) prefill.email = data.email;

      // Pre-fill email from step 1 email input
      if (emailInput.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
        prefill.email = emailInput.trim();
        data.emailProvided = true;
        data.email = emailInput.trim();
      }

      // Override parsed fields with extracted biz data
      if (biz?.name && !data.businessName) data.businessName = biz.name;
      if (biz?.phone) {
        data.phoneProvided = true;
        data.phone = biz.phone;
        prefill.phone = biz.phone;
      }

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
  const emailAnswer = answers.email || parsed?.email || "";
  const cleanedPhone = phoneAnswer.replace(/[\s\-()]/g, "");
  const isValidPhone = /^\+\d{7,15}$/.test(cleanedPhone) || /^\d{8,15}$/.test(cleanedPhone);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAnswer);
  const contactKeys = ['phone_number', 'phone', 'email', 'email_address', 'business_email', 'business_phone'];
  const requiredMissing = parsed?.details.missing.filter(
    (f) => f.required && !contactKeys.includes(f.key) && !answers[f.key]?.trim()
  ) || [];

  const canConfirm = taskType === "call"
    ? isValidPhone && requiredMissing.length === 0
    : isValidEmail && requiredMissing.length === 0;

  // Draft email via GPT
  const handleDraftEmail = async () => {
    if (!parsed) return;
    setDraftingEmail(true);
    setError("");

    const bizName = answers.businessName || parsed.businessName || "Business";
    const extraDetails = Object.entries(answers)
      .filter(([k, v]) => k !== "phone" && k !== "email" && k !== "businessName" && v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join(". ");
    const fullDescription = [message, extraDetails].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/tasks/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "draft",
          description: fullDescription,
          businessName: bizName,
          businessEmail: emailAnswer,
          country: selectedCountry.key,
          bookingName: answers.name || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to draft email");
        setDraftingEmail(false);
        return;
      }
      setEmailDraft(data);
      setStep("email-review");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setDraftingEmail(false);
  };

  // Send the approved email
  const handleSendEmail = async () => {
    if (!parsed || !emailDraft) return;
    setSubmitting(true);
    setError("");

    const bizName = answers.businessName || parsed.businessName || "Business";
    const extraDetails = Object.entries(answers)
      .filter(([k, v]) => k !== "phone" && k !== "email" && k !== "businessName" && v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join(". ");
    const fullDescription = [message, extraDetails].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/tasks/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          description: fullDescription,
          businessName: bizName,
          businessEmail: emailAnswer,
          country: selectedCountry.key,
          bookingName: answers.name || "",
          emailSubject: emailDraft.subject,
          emailBody: emailDraft.body,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send email");
        setSubmitting(false);
        return;
      }

      // Auto-save place
      if (bizName !== "Business" && emailAnswer) {
        savePlace({
          id: `${bizName}-${emailAnswer}`.toLowerCase().replace(/\s+/g, "-"),
          name: bizName,
          phone: "",
          address: extractedBiz?.address || undefined,
          category: parsed.category || extractedBiz?.category || undefined,
          url: extractedBiz?.url || undefined,
        });
      }

      router.push(`/dashboard/call/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // Step 2: Create the call task + save place
  const handleConfirm = async () => {
    if (!parsed) return;

    // For email tasks, go to draft step first
    if (taskType === "email") {
      handleDraftEmail();
      return;
    }

    setSubmitting(true);
    setError("");

    const bizName = answers.businessName || parsed.businessName || "Business";
    const bizPhone = phoneAnswer;

    // Build enriched description
    const extraDetails = Object.entries(answers)
      .filter(([k, v]) => k !== "phone" && k !== "email" && k !== "businessName" && v.trim())
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
          address: extractedBiz?.address || undefined,
          category: parsed.category || extractedBiz?.category || undefined,
          url: extractedBiz?.url || undefined,
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

  // ─── STEP 1: INPUT ───
  if (step === "input") {
    const quickTasks = taskType === "call" ? [
      { icon: "🏥", title: "Book a doctor", prompt: "Book a doctor appointment for a general checkup. Preferably sometime this week." },
      { icon: "🍣", title: "Reserve a table", prompt: "Book a table for 2 this Friday at 7pm. Counter seats if possible." },
      { icon: "🔧", title: "Report a repair", prompt: "Call my landlord and tell them there's a broken pipe in the bathroom. Ask when they can send someone to fix it." },
      { icon: "✂️", title: "Book a haircut", prompt: "Book a haircut for this Saturday afternoon. Men's cut." },
      { icon: "📞", title: "Dispute a bill", prompt: "Call about my latest bill — the charge is higher than usual. Ask them to explain the difference." },
      { icon: "📦", title: "Track a delivery", prompt: "Call about my delivery — it was supposed to arrive yesterday but hasn't. Ask for an update." },
    ] : [
      { icon: "🏨", title: "Hotel inquiry", prompt: "Email the hotel to confirm my booking dates and ask about early check-in availability." },
      { icon: "📝", title: "File a complaint", prompt: "Send a formal complaint about my internet service — it's been down for 3 days and I need a resolution." },
      { icon: "🏫", title: "School enrollment", prompt: "Ask the school about enrollment requirements and deadlines for the next semester." },
      { icon: "💰", title: "Request a refund", prompt: "Request a refund for my cancelled reservation. Include my booking reference." },
      { icon: "🏠", title: "Apartment inquiry", prompt: "Inquire about apartment rental availability, pricing, and move-in dates." },
      { icon: "📋", title: "Medical records", prompt: "Email the clinic to request a copy of my medical records for the past year." },
    ];

    return (
      <div className="max-w-2xl mx-auto px-2 flex flex-col" style={{ minHeight: "calc(100vh - 80px)" }}>
        {/* Compact header */}
        <div className="text-center pt-6 sm:pt-10 pb-4 sm:pb-6">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            What do you need <span className="gradient-text">Mosh</span> to do?
          </h1>

          {/* Call / Email toggle */}
          <div className="flex items-center gap-1 mt-4 p-1 rounded-2xl bg-[var(--card)] border border-[var(--border)] w-fit mx-auto">
            <button
              type="button"
              onClick={() => { setTaskType("call"); setUserChoseTaskType(true); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                taskType === "call"
                  ? "bg-[var(--accent)] text-black shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </button>
            <button
              type="button"
              onClick={() => { setTaskType("email"); setUserChoseTaskType(true); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                taskType === "email"
                  ? "bg-[var(--accent)] text-black shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </button>
          </div>
        </div>

        {/* ── FORM ── */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Task input + contact/name in one card */}
          <Card className="space-y-4 flex-shrink-0">
            {/* What do you need */}
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5 block">What do you need?</label>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Book a table for 2 this Friday at 7pm"
                rows={2}
                className="w-full px-3.5 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all resize-none leading-relaxed"
              />
              <p className="text-[10px] text-[var(--muted)] mt-0.5 px-0.5">One sentence is enough.</p>
            </div>

            {/* Contact + Name — always side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5 block">
                  {taskType === "call" ? "Phone / link" : "Email"}
                </label>
                {taskType === "email" ? (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="contact@biz.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all"
                    />
                  </div>
                ) : extractedBiz && !extractingUrl ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/30">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-sm truncate flex-1">{extractedBiz.name || extractedBiz.phone || "Added"}</span>
                    <button onClick={() => { setExtractedBiz(null); setSelectedPlace(null); setLinkInput(""); setLastExtractedUrl(""); }} className="cursor-pointer shrink-0">
                      <X className="w-3.5 h-3.5 text-[var(--muted)]" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    {linkInput.match(/^\+?\d/) ? (
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
                    ) : (
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
                    )}
                    <input
                      type="text"
                      value={linkInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLinkInput(val);
                        const urls = val.match(URL_REGEX);
                        if (urls && urls.length > 0 && urls[0] !== lastExtractedUrl) extractUrl(urls[0]);
                      }}
                      onBlur={() => {
                        const cleaned = linkInput.replace(/[\s\-()]/g, "");
                        if (/^\+?\d{7,15}$/.test(cleaned)) setExtractedBiz({ name: null, phone: linkInput.trim(), address: null, category: "other", image: null, hours: null, url: "" });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const cleaned = linkInput.replace(/[\s\-()]/g, "");
                          if (/^\+?\d{7,15}$/.test(cleaned)) setExtractedBiz({ name: null, phone: linkInput.trim(), address: null, category: "other", image: null, hours: null, url: "" });
                        }
                      }}
                      placeholder="+61 400 123 456"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all"
                    />
                  </div>
                )}
                {extractingUrl && (
                  <div className="flex items-center gap-1.5 mt-1 px-0.5">
                    <Loader2 className="w-3 h-3 text-[var(--accent)] animate-spin" />
                    <span className="text-[10px] text-[var(--muted)]">Finding business...</span>
                  </div>
                )}
                {savedPlaces.length > 0 && !linkInput && !extractedBiz && taskType === "call" && (
                  <div className="flex gap-1 mt-1.5 overflow-x-auto">
                    {savedPlaces.slice(0, 2).map((place) => (
                      <button key={place.id} type="button" onClick={() => applyPlace(place)}
                        className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] cursor-pointer transition-all ${
                          selectedPlace?.id === place.id ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)]/40"
                        }`}>
                        <span>{categoryIcons[place.category || "other"] || "📋"}</span>
                        <span>{place.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5 block">Your name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Sarah Johnson"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all"
                />
              </div>
            </div>

            {/* Continue button */}
            <button
              onClick={handleParse}
              disabled={message.trim().length < 10 || parsing}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
          </Card>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Quick start grid — fills remaining space, scrollable if needed */}
          {!message && (
            <div className="flex-1 min-h-0 overflow-y-auto pb-4">
              <p className="text-xs text-[var(--muted)] mb-2 text-center">or pick a common task</p>
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

          {/* Footer — only when message is typed */}
          {message && <div className="flex-1" />}
        </div>

        <div className="flex items-center justify-center gap-3 py-3 flex-shrink-0">
          <p className="text-[10px] text-[var(--muted)]">
            1 credit per task
          </p>
          {taskType === "email" && (
            <Link href="/dashboard/settings" className="flex items-center gap-1 text-[10px] text-[var(--accent)] hover:underline">
              <Settings className="w-3 h-3" /> Email settings
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ─── STEP 3: EMAIL REVIEW ───
  if (step === "email-review" && emailDraft) {
    return (
      <div className="max-w-2xl mx-auto px-2 py-6">
        {/* Back */}
        <button
          onClick={() => { setStep("clarify"); setEmailDraft(null); }}
          className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="space-y-5">
          {/* Header + translation toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-lg font-semibold">Review Email</h2>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--card)] border border-[var(--border)]">
              <button type="button" onClick={() => setShowTranslation(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${!showTranslation ? "bg-[var(--accent)] text-black" : "text-[var(--muted-foreground)]"}`}>
                {language}
              </button>
              <button type="button" onClick={() => setShowTranslation(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${showTranslation ? "bg-[var(--accent)] text-black" : "text-[var(--muted-foreground)]"}`}>
                <Eye className="w-3 h-3" /> English
              </button>
            </div>
          </div>

          {/* Email preview */}
          <Card className="space-y-0 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 p-4 text-sm">
              <span className="text-xs text-[var(--muted)] uppercase tracking-wider pt-0.5">To</span>
              <span>{emailAnswer}</span>
              <span className="text-xs text-[var(--muted)] uppercase tracking-wider pt-0.5">Subject</span>
              <span className="font-medium">{showTranslation ? emailDraft.subjectEnglish : emailDraft.subject}</span>
            </div>
            <div className="border-t border-[var(--border)] p-4">
              <div className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">
                {showTranslation ? emailDraft.bodyEnglish : emailDraft.body}
              </div>
            </div>
          </Card>

          {showTranslation && (
            <p className="text-[10px] text-[var(--muted)] text-center">
              The actual email will be sent in {language}, not English.
            </p>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setStep("clarify"); setEmailDraft(null); }} className="flex-1">
              <ArrowLeft className="w-4 h-4" /> Edit
            </Button>
            <Button onClick={handleSendEmail} loading={submitting} className="flex-1">
              <Send className="w-4 h-4" /> Send Email <span className="text-xs opacity-60 ml-1">· 1 credit</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 2: CLARIFY ───
  return (
    <div className="max-w-2xl mx-auto px-2 py-6">
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

            {/* What user typed — collapsed */}
            <p className="text-xs text-[var(--muted)] border-t border-[var(--border)] pt-3">&ldquo;{message}&rdquo;</p>
          </Card>

          {/* Follow-up questions */}
          <Card className="space-y-4">
            {/* Status message */}
            {(
              (taskType === "call" && (parsed.phoneProvided || extractedBiz?.phone)) ||
              (taskType === "email" && (parsed.emailProvided || emailAnswer))
            ) && parsed.details.missing.filter(f => !['phone_number', 'phone', 'email', 'email_address', 'business_email'].includes(f.key)).length === 0 && !parsed.fallbackQuestion ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <p className="text-sm font-medium">Ready to go!</p>
              </div>
            ) : (
              <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">A few details</p>
            )}

            {/* Phone */}
            {taskType === "call" && !parsed.phoneProvided && !extractedBiz?.phone && (
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">Phone number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
                  <input type="tel" value={answers.phone || ""} onChange={(e) => setAnswers((p) => ({ ...p, phone: e.target.value }))} placeholder="+61 400 123 456"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all" />
                </div>
                {answers.phone && !isValidPhone && <p className="text-[10px] text-red-400 mt-0.5 px-0.5">Include + country code</p>}
              </div>
            )}

            {/* Email */}
            {taskType === "email" && !parsed.emailProvided && (
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">Email address <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
                  <input type="email" value={answers.email || ""} onChange={(e) => setAnswers((p) => ({ ...p, email: e.target.value }))} placeholder="contact@business.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all" />
                </div>
                {answers.email && !isValidEmail && <p className="text-[10px] text-red-400 mt-0.5 px-0.5">Enter a valid email</p>}
              </div>
            )}

            {/* Dynamic fields */}
            {parsed.details.missing
              .filter((f) => !['phone_number', 'phone', 'email', 'email_address', 'business_email'].includes(f.key))
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
                    placeholder={field.type === "phone" ? "+61 400 123 456" : ""}
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

          {/* Task type toggle + Confirm */}
          <div className="flex items-center gap-3">
            {parsed.suggestedTaskType && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                <button type="button" onClick={() => { setTaskType("call"); setUserChoseTaskType(true); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${taskType === "call" ? "bg-[var(--accent)] text-black" : "text-[var(--muted-foreground)]"}`}>
                  <Phone className="w-3 h-3" /> Call
                </button>
                <button type="button" onClick={() => { setTaskType("email"); setUserChoseTaskType(true); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${taskType === "email" ? "bg-[var(--accent)] text-black" : "text-[var(--muted-foreground)]"}`}>
                  <Mail className="w-3 h-3" /> Email
                </button>
              </div>
            )}

            <Button onClick={handleConfirm} loading={submitting || draftingEmail} disabled={!canConfirm} size="lg" className="flex-1">
              {taskType === "call" ? (
                <><Send className="w-4 h-4" /> Send Mosh <span className="text-xs opacity-60 ml-1">· 1 credit</span></>
              ) : (
                <><FileText className="w-4 h-4" /> {draftingEmail ? "Drafting..." : "Preview draft"} <span className="text-xs opacity-60 ml-1">· 1 credit</span></>
              )}
            </Button>
          </div>

          {!canConfirm && (
            <p className="text-[10px] text-[var(--muted)] text-center">
              {taskType === "call" && !isValidPhone ? "Add a phone number with country code" : taskType === "email" && !isValidEmail ? "Add an email address" : "Fill in required fields"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
