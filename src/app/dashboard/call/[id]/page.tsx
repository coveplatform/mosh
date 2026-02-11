"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Phone,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  MessageSquare,
  AlertCircle,
  RotateCcw,
  PhoneOff,
  ArrowRight,
  Info,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface CallDetail {
  id: string;
  businessName: string;
  businessPhone: string;
  country: string;
  language: string;
  status: string;
  tier: string;
  objective: string;
  detailedNotes?: string;
  tonePreference: string;
  constraints?: string;
  fallbackOptions?: string;
  culturalNotes?: string;
  openingScript?: string;
  callPlan?: string;
  transcript?: string;
  summary?: string;
  outcome?: string;
  actionItems?: string;
  recordingUrl?: string;
  creditsUsed: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [call, setCall] = useState<CallDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const fetchCall = () => {
    if (params.id) {
      fetch(`/api/calls/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setCall(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchCall();
  }, [params.id]);

  // Poll every 5s while call is in_progress
  useEffect(() => {
    if (call?.status === "in_progress") {
      const interval = setInterval(fetchCall, 5000);
      return () => clearInterval(interval);
    }
  }, [call?.status, params.id]);

  const handleMakeCall = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`/api/tasks/${params.id}/call`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        // Refresh the call data to show updated status
        fetchCall();
      }
    } catch {
      alert("Failed to initiate call. Please try again.");
    }
    setSimulating(false);
  };

  const handleMarkFailed = async () => {
    try {
      await fetch(`/api/calls/${params.id}/fail`, { method: "POST" });
      fetchCall();
    } catch {
      alert("Failed to update call status.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-[var(--card)] rounded-lg" />
        <div className="h-48 bg-[var(--card)] rounded-xl" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-8 h-8 text-[var(--muted)] mx-auto mb-3" />
        <p className="text-[var(--muted-foreground)]">Task not found</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Back to Tasks
          </Button>
        </Link>
      </div>
    );
  }

  // Parse structured data from actionItems (JSON) if available
  const structuredData = (() => {
    if (!call?.actionItems) return null;
    try {
      const parsed = JSON.parse(call.actionItems);
      if (parsed.outcomeLabel || parsed.nextSteps || parsed.confirmedDetails) return parsed;
      return null;
    } catch {
      return null;
    }
  })();

  // Clean objective display — use structured plain English version if available, otherwise clean up raw text
  const displayObjective = structuredData?.objectivePlainEnglish ||
    call?.objective?.replace(/The caller's name is "[^"]*"\.\s*/g, "").replace(/This is urgent.*?\.\s*/g, "").trim() ||
    "";

  const outcomeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
    success:         { icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Completed" },
    partial:         { icon: <Info className="w-5 h-5" />,        color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   label: "Partially completed" },
    failed:          { icon: <XCircle className="w-5 h-5" />,     color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     label: "Not completed" },
    callback_needed: { icon: <Phone className="w-5 h-5" />,       color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    label: "Callback needed" },
    waitlisted:      { icon: <Clock className="w-5 h-5" />,       color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   label: "On waitlist" },
    voicemail:       { icon: <PhoneOff className="w-5 h-5" />,    color: "text-zinc-400",    bg: "bg-zinc-500/10",    border: "border-zinc-500/20",    label: "Went to voicemail" },
    no_answer:       { icon: <PhoneOff className="w-5 h-5" />,    color: "text-zinc-400",    bg: "bg-zinc-500/10",    border: "border-zinc-500/20",    label: "No answer" },
  };

  const oc = outcomeConfig[call.outcome || ""] || outcomeConfig.partial;
  const outcomeLabel = structuredData?.outcomeLabel || oc.label;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to tasks
      </button>

      {/* ─── STATUS BANNER (pending / in progress) ─── */}
      {call.status === "pending" && (
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Ready to call</p>
              <p className="text-xs text-[var(--muted)]">Mosh will call {call.businessName} and handle the conversation.</p>
            </div>
          </div>
          <Button onClick={handleMakeCall} loading={simulating}>
            <Phone className="w-4 h-4" />
            Start Call
          </Button>
        </Card>
      )}

      {call.status === "in_progress" && (
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-medium">Mosh is on the call</p>
              <p className="text-xs text-[var(--muted)]">Speaking with {call.businessName}. This page will update automatically.</p>
            </div>
          </div>
          {call.startedAt && (Date.now() - new Date(call.startedAt).getTime() > 5 * 60 * 1000) && (
            <Button variant="ghost" size="sm" onClick={handleMarkFailed} className="text-red-400 hover:text-red-300">
              <PhoneOff className="w-3 h-3" />
              Mark Failed
            </Button>
          )}
        </Card>
      )}

      {/* ─── RESULT CARD (completed / failed) ─── */}
      {(call.status === "completed" || call.status === "failed") && call.summary && (
        <Card glow className={`${oc.border} space-y-0`}>
          {/* Outcome header */}
          <div className={`flex items-center gap-3 p-4 rounded-t-xl ${oc.bg}`}>
            <div className={oc.color}>{oc.icon}</div>
            <div className="flex-1">
              <p className={`text-base font-semibold ${oc.color}`}>{outcomeLabel}</p>
              <p className="text-xs text-[var(--muted)]">{call.businessName} · {formatDate(call.completedAt || call.createdAt)}</p>
            </div>
            {(call.status === "failed" || call.outcome === "callback_needed") && (
              <Button onClick={handleMakeCall} loading={simulating} variant="outline" size="sm">
                <RotateCcw className="w-3.5 h-3.5" />
                {call.outcome === "callback_needed" ? "Call Back" : "Retry"}
              </Button>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 space-y-4">
            <p className="text-sm leading-relaxed">{call.summary}</p>

            {/* Reason (if not success) */}
            {structuredData?.reason && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                <Info className="w-4 h-4 text-[var(--muted)] mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--muted-foreground)]">{structuredData.reason}</p>
              </div>
            )}

            {/* Confirmed details */}
            {structuredData?.confirmedDetails && (
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">Confirmed Details</p>
                <div className="flex flex-wrap gap-2">
                  {structuredData.confirmedDetails.split(",").map((detail: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                      <CheckCircle className="w-3 h-3" />
                      {detail.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Next steps */}
            {structuredData?.nextSteps && (
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">What You Need To Do</p>
                <div className="space-y-1.5">
                  {structuredData.nextSteps.split("\n").filter((s: string) => s.trim()).map((step: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
                      <span className="text-[var(--muted-foreground)]">{step.replace(/^[-•]\s*/, "").trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy action items (for old calls without structured data) */}
            {!structuredData && call.actionItems && (
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">Action Items</p>
                <p className="text-sm text-[var(--muted-foreground)]">{call.actionItems}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ─── YOUR REQUEST ─── */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-medium">Your Request</h3>
        </div>
        <p className="text-sm">{displayObjective || call.objective}</p>
        {call.detailedNotes && (
          <p className="text-sm text-[var(--muted-foreground)] mt-2">{call.detailedNotes}</p>
        )}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--muted)]">
          <span className="capitalize">{call.country}</span>
          <span>{call.language}</span>
          <span>{call.businessPhone}</span>
          <span>{call.creditsUsed} credit{call.creditsUsed > 1 ? "s" : ""}</span>
        </div>
      </Card>

      {/* ─── RECORDING ─── */}
      {call.recordingUrl && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-sm font-medium">Call Recording</h3>
          </div>
          <audio controls className="w-full" src={call.recordingUrl} />
        </Card>
      )}

      {/* ─── TRANSCRIPT (collapsible) ─── */}
      {call.transcript && (
        <Card>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-sm font-medium">Full Transcript</h3>
            </div>
            <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform ${showTranscript ? "rotate-180" : ""}`} />
          </button>

          {showTranscript && (
            <div className="mt-4 bg-[var(--background)] rounded-lg p-4 space-y-2.5">
              {call.transcript.split("\n").filter(l => l.trim()).map((line, i) => {
                const isMoshi = line.startsWith("Agent:") || line.startsWith("Moshi:") || line.startsWith("Mosh:") || line.startsWith("AI:");
                const isBiz = line.startsWith("Business:") || line.startsWith("User:");
                return (
                  <div key={i} className={`flex gap-2 ${!isMoshi && !isBiz ? "opacity-50" : ""}`}>
                    {isMoshi && <span className="text-xs font-medium text-[var(--accent)] w-14 shrink-0 pt-0.5">Mosh</span>}
                    {isBiz && <span className="text-xs font-medium text-[var(--foreground)] w-14 shrink-0 pt-0.5">Them</span>}
                    {!isMoshi && !isBiz && <span className="text-xs w-14 shrink-0 pt-0.5" />}
                    <p className={`text-sm leading-relaxed ${isMoshi ? "text-[var(--accent)]" : isBiz ? "text-[var(--foreground)]" : "text-[var(--muted)] text-xs"}`}>
                      {line.replace(/^(Agent|Moshi|Mosh|AI|Business|User):\s*/i, "")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* ─── TIMELINE ─── */}
      <div className="flex items-center justify-center gap-6 text-[10px] text-[var(--muted)] pb-4">
        <span>Created {formatDate(call.createdAt)}</span>
        {call.startedAt && <span>Started {formatDate(call.startedAt)}</span>}
        {call.completedAt && <span>Completed {formatDate(call.completedAt)}</span>}
      </div>
    </div>
  );
}
