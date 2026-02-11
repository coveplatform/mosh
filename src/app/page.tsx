"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoshLogo } from "@/components/logo";
import {
  Phone,
  ArrowRight,
  Languages,
  Sparkles,
  Star,
  ChevronDown,
  CheckCircle,
  Shield,
  FileText,
  Puzzle,
  Globe,
  BarChart3,
  Info,
} from "lucide-react";

// ─── DATA ───

const languageTicker = [
  "もしもし", "여보세요", "你好", "Bonjour", "Hola", "Hallo", "Ciao", "สวัสดี", "Olá", "Hello",
  "もしもし", "여보세요", "你好", "Bonjour", "Hola", "Hallo", "Ciao", "สวัสดี", "Olá", "Hello",
];

const socialProof = [
  { icon: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=80&h=80&fit=crop", task: "Restaurant booked", detail: "Sushi Tanaka, Tokyo", sub: "Fri 7pm \u00b7 2 guests \u00b7 Counter seats", time: "1m 42s", country: "JP" },
  { icon: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=80&h=80&fit=crop", task: "Doctor appointment", detail: "Seoul Medical Clinic", sub: "Thu 2pm \u00b7 Dr. Park \u00b7 Checkup", time: "2m 10s", country: "KR" },
  { icon: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=80&h=80&fit=crop", task: "Salon appointment", detail: "Coiffure \u00c9lise, Paris", sub: "Sat 11am \u00b7 Cut & color", time: "1m 55s", country: "FR" },
  { icon: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=80&h=80&fit=crop", task: "Bill dispute resolved", detail: "Movistar, Madrid", sub: "\u20ac12 credit applied to next bill", time: "3m 20s", country: "ES" },
  { icon: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80&h=80&fit=crop", task: "Heater repair", detail: "Sakura Property Mgmt", sub: "Tomorrow 10am \u00b7 Technician", time: "1m 30s", country: "JP" },
  { icon: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=80&h=80&fit=crop", task: "Gym cancelled", detail: "FitX, Berlin", sub: "Effective end of month", time: "2m 45s", country: "DE" },
  { icon: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=80&h=80&fit=crop", task: "Vet appointment", detail: "Osaka Pet Clinic", sub: "Mon 3pm \u00b7 Annual checkup", time: "1m 15s", country: "JP" },
  { icon: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=80&h=80&fit=crop", task: "Dentist booked", detail: "Seoul Smile Dental", sub: "Wed 10am \u00b7 Cleaning", time: "1m 50s", country: "KR" },
  { icon: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=80&h=80&fit=crop", task: "Plumber scheduled", detail: "Dupont Services, Lyon", sub: "Tomorrow 9am", time: "2m 05s", country: "FR" },
  { icon: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=80&h=80&fit=crop", task: "Reservation changed", detail: "Casa Miguel, Barcelona", sub: "Moved to Sat 8pm \u00b7 4 guests", time: "1m 38s", country: "ES" },
  { icon: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=80&h=80&fit=crop", task: "Restaurant booked", detail: "Sushi Tanaka, Tokyo", sub: "Fri 7pm \u00b7 2 guests \u00b7 Counter seats", time: "1m 42s", country: "JP" },
  { icon: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=80&h=80&fit=crop", task: "Doctor appointment", detail: "Seoul Medical Clinic", sub: "Thu 2pm \u00b7 Dr. Park \u00b7 Checkup", time: "2m 10s", country: "KR" },
  { icon: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=80&h=80&fit=crop", task: "Salon appointment", detail: "Coiffure \u00c9lise, Paris", sub: "Sat 11am \u00b7 Cut & color", time: "1m 55s", country: "FR" },
  { icon: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=80&h=80&fit=crop", task: "Bill dispute resolved", detail: "Movistar, Madrid", sub: "\u20ac12 credit applied to next bill", time: "3m 20s", country: "ES" },
  { icon: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80&h=80&fit=crop", task: "Heater repair", detail: "Sakura Property Mgmt", sub: "Tomorrow 10am \u00b7 Technician", time: "1m 30s", country: "JP" },
  { icon: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=80&h=80&fit=crop", task: "Gym cancelled", detail: "FitX, Berlin", sub: "Effective end of month", time: "2m 45s", country: "DE" },
  { icon: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=80&h=80&fit=crop", task: "Vet appointment", detail: "Osaka Pet Clinic", sub: "Mon 3pm \u00b7 Annual checkup", time: "1m 15s", country: "JP" },
  { icon: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=80&h=80&fit=crop", task: "Dentist booked", detail: "Seoul Smile Dental", sub: "Wed 10am \u00b7 Cleaning", time: "1m 50s", country: "KR" },
  { icon: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=80&h=80&fit=crop", task: "Plumber scheduled", detail: "Dupont Services, Lyon", sub: "Tomorrow 9am", time: "2m 05s", country: "FR" },
  { icon: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=80&h=80&fit=crop", task: "Reservation changed", detail: "Casa Miguel, Barcelona", sub: "Moved to Sat 8pm \u00b7 4 guests", time: "1m 38s", country: "ES" },
];

const features = [
  {
    icon: Phone,
    title: "Real Phone Calls",
    description: "Mosh dials the number and has a live conversation — not a chatbot, a real call with a real person on the other end.",
  },
  {
    icon: Languages,
    title: "10+ Languages",
    description: "Japanese, Korean, Mandarin, French, Spanish, German, Italian, Thai, Portuguese, and English.",
  },
  {
    icon: FileText,
    title: "Full Transcript & Summary",
    description: "Every call is transcribed and summarized. You get outcomes, action items, and next steps — instantly.",
  },
  {
    icon: Sparkles,
    title: "Culturally Fluent",
    description: "Not just translation. Mosh knows local etiquette, business customs, and how to navigate bureaucracy.",
  },
  {
    icon: Shield,
    title: "You Stay in Control",
    description: "Review the plan before it goes out. Mosh asks you if the business needs info only you can provide.",
  },
];

const useCases = [
  {
    id: "restaurant",
    tab: "Restaurant",
    country: "JP",
    title: "Reserve a sushi counter in Tokyo",
    bizName: "Sushi Tanaka",
    userTyped: "Book a table for 2 this Friday at 7pm. Counter seats if possible.",
    lang: "Japanese",
    duration: "1m 42s",
    type: "call" as const,
    outcome: "Booked — Friday 7pm, 2 people, counter seats, under Sarah",
    transcript: [
      { speaker: "moshi", text: "すみません、お忙しいところ失礼します。クライアントの代わりにお電話しています。今週の金曜日、19時に2名で予約をお願いしたいのですが。", en: "Excuse me for calling at a busy time. I'm calling on behalf of a client. I'd like to make a reservation for 2 this Friday at 7pm.", ts: "0:04" },
      { speaker: "biz", text: "金曜日の19時ですね。カウンター席でよろしいですか？", en: "Friday at 7pm, correct? Would counter seats be alright?", ts: "0:18" },
      { speaker: "moshi", text: "はい、カウンター席でお願いします。予約名はサラです。", en: "Yes, counter seats please. The reservation name is Sarah.", ts: "0:26" },
      { speaker: "biz", text: "かしこまりました。金曜19時、2名、サラ様でお取りしました。", en: "Understood. Friday 7pm, 2 people, booked under Sarah.", ts: "0:38" },
    ],
  },
  {
    id: "doctor",
    tab: "Doctor",
    country: "KR",
    title: "Book a clinic appointment in Seoul",
    bizName: "Seoul Medical Clinic",
    userTyped: "Book a doctor appointment for a general checkup. Sometime this week if possible.",
    lang: "Korean",
    duration: "2m 10s",
    type: "call" as const,
    outcome: "Booked — Thursday 2pm, Dr. Park, general checkup",
    transcript: [
      { speaker: "moshi", text: "안녕하세요, 고객을 대신해서 전화드립니다. 이번 주에 일반 건강검진 예약을 하고 싶습니다.", en: "Hello, I'm calling on behalf of a client. I'd like to book a general checkup appointment this week.", ts: "0:03" },
      { speaker: "biz", text: "네, 목요일 오후 2시에 박 선생님 진료가 가능합니다.", en: "Yes, Dr. Park is available Thursday at 2pm.", ts: "0:15" },
      { speaker: "moshi", text: "좋습니다. 예약 부탁드립니다. 이름은 Alex Morgan입니다.", en: "Great. Please book it. The name is Alex Morgan.", ts: "0:24" },
      { speaker: "biz", text: "알겠습니다. 목요일 오후 2시, Alex Morgan님으로 예약되었습니다.", en: "Understood. Thursday 2pm, booked under Alex Morgan.", ts: "0:35" },
    ],
  },
  {
    id: "repair",
    tab: "Repair",
    country: "JP",
    title: "Report a broken heater to your landlord",
    bizName: "Sakura Property Mgmt",
    userTyped: "Call my landlord and tell them the heater stopped working. Ask when they can fix it.",
    lang: "Japanese",
    duration: "1m 30s",
    type: "call" as const,
    outcome: "Reported — Technician scheduled for tomorrow 10am",
    transcript: [
      { speaker: "moshi", text: "お世話になっております。入居者の代わりにお電話しています。暖房が動かなくなったとのことで、修理をお願いしたいのですが。", en: "Thank you for your time. I'm calling on behalf of a tenant. The heater has stopped working and we'd like to request a repair.", ts: "0:05" },
      { speaker: "biz", text: "承知しました。明日の午前10時に技術者を手配できますが、ご都合いかがですか？", en: "Understood. We can arrange a technician for tomorrow at 10am — does that work?", ts: "0:20" },
      { speaker: "moshi", text: "はい、午前10時で大丈夫です。よろしくお願いいたします。", en: "Yes, 10am works fine. Thank you very much.", ts: "0:30" },
      { speaker: "biz", text: "では明日10時にお伺いします。", en: "We'll be there tomorrow at 10am.", ts: "0:40" },
    ],
  },
  {
    id: "bill",
    tab: "Dispute",
    country: "ES",
    title: "Dispute an internet bill in Spanish",
    bizName: "Movistar",
    userTyped: "Call about my latest bill — the charge is higher than usual. Ask them to explain.",
    lang: "Spanish",
    duration: "3m 20s",
    type: "call" as const,
    outcome: "Resolved — Overcharge of €12 credited to next bill",
    transcript: [
      { speaker: "moshi", text: "Buenos días, llamo en nombre de un cliente respecto a su última factura. El importe es más alto de lo habitual y quisiéramos una explicación.", en: "Good morning, I'm calling on behalf of a client regarding their latest bill. The amount is higher than usual and we'd like an explanation.", ts: "0:06" },
      { speaker: "biz", text: "Déjeme verificar... Veo un cargo adicional de 12 euros por un servicio premium que se activó automáticamente.", en: "Let me check... I see an additional charge of 12 euros for a premium service that was activated automatically.", ts: "0:22" },
      { speaker: "moshi", text: "El cliente no solicitó ese servicio. ¿Podrían revertir el cargo?", en: "The client did not request that service. Could you reverse the charge?", ts: "0:38" },
      { speaker: "biz", text: "Por supuesto, he aplicado un crédito de 12 euros a la próxima factura.", en: "Of course, I've applied a 12 euro credit to the next bill.", ts: "0:52" },
    ],
  },
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "Living in Tokyo",
    avatar: "S",
    text: "I needed to call my landlord about a leak but my Japanese isn't good enough for phone calls. Mosh handled it in 10 minutes and got a plumber scheduled for the next day.",
    rating: 5,
  },
  {
    name: "Marcus T.",
    role: "Remote worker in Seoul",
    avatar: "M",
    text: "I use Mosh for everything — doctor appointments, bills, restaurant bookings. It's like having a bilingual assistant on call 24/7.",
    rating: 5,
  },
  {
    name: "Elena R.",
    role: "Traveling in Japan",
    avatar: "E",
    text: "Booked a phone-only sushi counter in Ginza from my hotel room. The chef doesn't speak English. Mosh called, booked it, and I got a confirmation in 5 minutes.",
    rating: 5,
  },
  {
    name: "David L.",
    role: "Digital nomad in Barcelona",
    avatar: "D",
    text: "Called my Spanish phone company about a wrong charge. Mosh handled the whole dispute in fluent Spanish. Credit applied on the spot.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "What is Mosh?",
    a: "Mosh makes real phone calls on your behalf, in any language. You type what you need in English, and Mosh calls the business in the local language — whether it's booking a doctor in Seoul or reserving a table in Tokyo.",
  },
  {
    q: "How does a phone call work?",
    a: "Mosh dials the real phone number and has a live, natural conversation with the person on the other end. It speaks the local language fluently, follows cultural norms, and reports back with a full transcript, summary, and action items.",
  },
  {
    q: "What languages does Mosh support?",
    a: "Mosh currently supports Japanese, Korean, Mandarin, French, Spanish, German, Italian, Thai, Portuguese, and English — with more languages being added regularly.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes! The Explorer plan includes 3 free tasks per month with no credit card required. You can upgrade to Member (15 tasks/mo) or Global (50 tasks/mo) when you need more.",
  },
  {
    q: "Can I review what Mosh will say before it calls?",
    a: "Absolutely. Before any call, Mosh shows you exactly what it plans to say and asks for any missing details. You're always in control.",
  },
  {
    q: "What happens if the call doesn't go as planned?",
    a: "If a call goes to voicemail, gets no answer, or fails, your credit is automatically refunded. For partial completions, Mosh reports what happened and suggests next steps.",
  },
];

// ─── COMPONENTS ───

const countryFlags: Record<string, string> = {
  JP: "https://flagcdn.com/w40/jp.png",
  KR: "https://flagcdn.com/w40/kr.png",
  FR: "https://flagcdn.com/w40/fr.png",
  ES: "https://flagcdn.com/w40/es.png",
  IT: "https://flagcdn.com/w40/it.png",
  CN: "https://flagcdn.com/w40/cn.png",
  DE: "https://flagcdn.com/w40/de.png",
  TH: "https://flagcdn.com/w40/th.png",
  BR: "https://flagcdn.com/w40/br.png",
  US: "https://flagcdn.com/w40/us.png",
  AU: "https://flagcdn.com/w40/au.png",
  GB: "https://flagcdn.com/w40/gb.png",
};

function CountryFlag({ code, size = 20 }: { code: string; size?: number }) {
  const src = countryFlags[code];
  if (!src) return <span className="text-xs font-bold text-[var(--muted)]">{code}</span>;
  return <img src={src} alt={code} width={size} height={Math.round(size * 0.75)} className="rounded-[3px] object-cover inline-block" style={{ width: size, height: Math.round(size * 0.75) }} />;
}

const heroDemos = [
  { text: "Book a table for 2 at a sushi restaurant in Tokyo, Friday 7pm", country: "JP", countryName: "Japanese", result: "Booked \u2014 Fri 7pm, counter seats, under Sarah", time: "1m 42s" },
  { text: "Schedule a dentist appointment in Seoul for a cleaning this week", country: "KR", countryName: "Korean", result: "Booked \u2014 Wed 10am, Seoul Smile Dental, Dr. Kim", time: "2m 10s" },
  { text: "Call my landlord in Paris about the broken washing machine", country: "FR", countryName: "French", result: "Scheduled \u2014 Repair technician, tomorrow 9am", time: "1m 55s" },
  { text: "Dispute the extra charge on my phone bill with Movistar in Madrid", country: "ES", countryName: "Spanish", result: "Resolved \u2014 \u20ac12 credit applied to next bill", time: "3m 20s" },
  { text: "Make a reservation at an Italian restaurant in Rome for Saturday", country: "IT", countryName: "Italian", result: "Booked \u2014 Sat 8pm, 4 guests, Trattoria da Luigi", time: "1m 38s" },
];

function HeroDemo() {
  const [demoIndex, setDemoIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [phase, setPhase] = useState<"typing" | "done" | "calling" | "result">("typing");

  const demo = heroDemos[demoIndex];

  const startTyping = useCallback(() => {
    setPhase("typing");
    setDisplayText("");
    let i = 0;
    const text = heroDemos[demoIndex].text;
    const interval = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("done"), 400);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [demoIndex]);

  useEffect(() => {
    const cleanup = startTyping();
    return cleanup;
  }, [startTyping]);

  useEffect(() => {
    if (phase === "done") {
      const t = setTimeout(() => setPhase("calling"), 1500);
      return () => clearTimeout(t);
    }
    if (phase === "calling") {
      const t = setTimeout(() => setPhase("result"), 2000);
      return () => clearTimeout(t);
    }
    if (phase === "result") {
      const t = setTimeout(() => {
        setDemoIndex((prev) => (prev + 1) % heroDemos.length);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <section className="h-dvh flex flex-col items-center pt-28 sm:pt-36 pb-6 px-6 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full blur-[180px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(124,92,252,0.15) 0%, transparent 70%)" }} />
      <div className="absolute top-60 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%)" }} />

      <div className="max-w-3xl mx-auto w-full relative flex-1 flex flex-col">
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] leading-[0.95] text-center mb-4">
          Make the call
          <br />
          <span className="gradient-text">you can&apos;t make.</span>
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] text-center max-w-xl mx-auto leading-relaxed mb-8">
          Type what you need in English. Mosh calls the business in the local language and reports back.
        </p>

        {/* Demo card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-black/30 overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border)]">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-3 text-xs text-[var(--muted)]">mosh</span>
            <div className="ml-auto flex items-center gap-1.5">
              {heroDemos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setDemoIndex(i)}
                  aria-label={`Demo ${i + 1}`}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === demoIndex ? "bg-[var(--accent)] w-5" : "bg-[var(--muted)]/30 hover:bg-[var(--muted)]/50"}`}
                />
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="p-5 sm:p-6 min-h-[150px]">
            <p className="text-sm font-medium text-[var(--foreground)]/60 mb-3">What do you need?</p>
            <p className="text-lg sm:text-xl text-[var(--foreground)] leading-relaxed text-left min-h-[56px]">
              {displayText}
              {phase === "typing" && <span className="inline-block w-[2px] h-6 bg-[var(--accent)] ml-0.5 animate-pulse align-text-bottom" />}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CountryFlag code={demo.country} size={22} />
                <span className="text-sm text-[var(--muted-foreground)]">{demo.countryName} &middot; Phone Call</span>
              </div>
              <button
                onClick={() => { if (phase === "done") setPhase("calling"); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  phase === "done"
                    ? "text-white shadow-lg shadow-[var(--accent)]/25 hover:scale-105"
                    : phase === "typing"
                    ? "text-[var(--muted-foreground)] bg-[var(--card-hover)] border border-[var(--border)] cursor-default"
                    : "text-white shadow-lg shadow-[var(--accent)]/25"
                }`}
                style={phase !== "typing" ? { background: "linear-gradient(135deg, #7c5cfc, #c084fc)" } : undefined}
              >
                <Phone className="w-4 h-4" />
                {phase === "typing" ? "Make Call" : phase === "done" ? "Make Call" : phase === "calling" ? "Calling..." : "Make Call"}
              </button>
            </div>
          </div>

          {/* Status bar */}
          {(phase === "calling" || phase === "result") && (
            <div className="px-5 sm:px-6 py-3.5 border-t border-[var(--border)] bg-emerald-500/5">
              {phase === "calling" && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[0, 0.15, 0.3, 0.45, 0.6].map((d, i) => (
                      <div key={i} className="soundwave-bar w-[3px] rounded-full bg-[var(--accent)]" style={{ height: `${[10, 18, 24, 18, 10][i]}px`, animationDelay: `${d}s` }} />
                    ))}
                  </div>
                  <span className="text-sm text-[var(--accent)] font-medium">Calling in {demo.countryName}...</span>
                </div>
              )}
              {phase === "result" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm text-emerald-400 font-semibold">{demo.result}</span>
                  </div>
                  <span className="text-xs text-[var(--muted)] font-mono">{demo.time}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spacer pushes social proof to bottom */}
        <div className="flex-1" />

        {/* Social proof — flush with bottom of screen */}
        <div className="w-screen relative left-1/2 -translate-x-1/2">
          <SocialProofTicker />
        </div>

      </div>
    </section>
  );
}

function LanguageMarquee() {
  return (
    <div className="relative overflow-hidden py-6 border-y border-[var(--border)]">
      <div className="absolute left-0 top-0 bottom-0 w-32 z-10" style={{ background: "linear-gradient(to right, var(--background), transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-10" style={{ background: "linear-gradient(to left, var(--background), transparent)" }} />
      <div className="flex animate-marquee whitespace-nowrap">
        {languageTicker.map((word, i) => (
          <span key={i} className="mx-8 text-2xl sm:text-3xl font-bold select-none gradient-text opacity-40">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

function SocialProofTicker() {
  return (
    <div className="relative overflow-hidden py-8">
      <div className="absolute left-0 top-0 bottom-0 w-40 z-10" style={{ background: "linear-gradient(to right, var(--background), transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-40 z-10" style={{ background: "linear-gradient(to left, var(--background), transparent)" }} />
      <div className="flex animate-marquee whitespace-nowrap">
        {socialProof.map((item, i) => (
          <div key={i} className="inline-flex items-center gap-4 mx-6 shrink-0">
            <Image src={item.icon} alt={item.detail} width={44} height={44} className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-[var(--border)]" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-400 font-semibold whitespace-nowrap">{item.task}</p>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] whitespace-nowrap">{item.detail} &middot; <span className="font-mono text-xs">{item.time}</span></p>
            </div>
            <div className="w-px h-8 bg-[var(--border)] ml-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(124,92,252,0.04) 0%, transparent 50%, rgba(124,92,252,0.02) 100%)" }} />
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em]">
            You type. We call.<br /><span className="gradient-text">You get results.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent)]/40 to-emerald-400/20" />

          {[
            {
              num: "1",
              title: "Describe your task",
              desc: "Type in plain English. \"Book a restaurant in Tokyo\" or \"Dispute my phone bill in Madrid.\" One sentence is enough.",
              accent: "text-[var(--accent)]",
              dot: "bg-[var(--accent)]",
            },
            {
              num: "2",
              title: "Mosh makes the call",
              desc: "A real phone call to a real person, in fluent Japanese, Korean, French, Spanish — whatever the business speaks.",
              accent: "text-[var(--accent)]",
              dot: "bg-[var(--accent)]",
            },
            {
              num: "3",
              title: "Done. Check your dashboard.",
              desc: "Full transcript, English translation, what was booked, and what you need to do next. Delivered in minutes.",
              accent: "text-emerald-400",
              dot: "bg-emerald-400",
            },
          ].map((step) => (
            <div key={step.num} className="text-center px-4 md:px-8 relative">
              <div className={`w-10 h-10 rounded-full ${step.dot} mx-auto flex items-center justify-center text-sm font-bold text-white mb-6`}>
                {step.num}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Soundwave icon component for use case cards
function SoundwaveIcon({ color }: { color: string }) {
  const delays = [0, 0.1, 0.2, 0.3, 0.4];
  const heights = [8, 16, 22, 16, 8];
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center gap-[2px] ${color}`}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="soundwave-bar w-[2px] rounded-full bg-white"
          style={{ height: `${h}px`, animationDelay: `${delays[i]}s` }}
        />
      ))}
    </div>
  );
}

// Playground tab definitions
const playgroundTabs = [
  { id: "use-cases", label: "Use Cases", icon: Puzzle },
  { id: "how-it-calls", label: "How Mosh Calls", icon: Phone },
  { id: "languages", label: "Languages", icon: Globe },
  { id: "results", label: "Results", icon: BarChart3 },
];

// Colors for use case soundwave icons
const useCaseColors: Record<string, string> = {
  restaurant: "bg-pink-500",
  doctor: "bg-blue-500",
  repair: "bg-amber-500",
  hotel: "bg-violet-500",
  bill: "bg-emerald-500",
};

function Playground() {
  const [activeTab, setActiveTab] = useState("use-cases");
  const [activeCase, setActiveCase] = useState("restaurant");
  const [animKey, setAnimKey] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const uc = useCases.find((u) => u.id === activeCase) || useCases[0];

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    setAnimKey((k) => k + 1);
  };

  const switchCase = (caseId: string) => {
    setActiveCase(caseId);
    setAnimKey((k) => k + 1);
  };

  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em]">Don&apos;t speak the language?<br /><span className="gradient-text">You don&apos;t have to.</span></h2>
          <p className="text-lg text-[var(--muted-foreground)] mt-4 max-w-lg mx-auto">
            Real phone calls, handled in the local language. See exactly what happens.
          </p>
        </div>

        {/* Playground container */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xl shadow-black/20">
          {/* Tab bar — equal width tabs spanning full width */}
          <div className="grid grid-cols-4 border-b border-[var(--border)] overflow-x-auto">
            {playgroundTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "text-[var(--foreground)] border-[var(--accent)] bg-[var(--accent)]/5"
                    : "text-[var(--muted-foreground)] border-transparent hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${activeTab === tab.id ? "text-[var(--accent)]" : ""}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div key={animKey}>
            {/* ─── USE CASES TAB ─── */}
            {activeTab === "use-cases" && (
              <div className="flex flex-col lg:flex-row lg:min-h-[480px]">
                {/* Mobile: horizontal scrollable pills */}
                <div className="lg:hidden border-b border-[var(--border)] p-3 overflow-x-auto">
                  <div className="flex gap-2 min-w-max">
                    {useCases.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => switchCase(u.id)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                          activeCase === u.id
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--card-hover)] text-[var(--muted-foreground)] border border-[var(--border)]"
                        }`}
                      >
                        {u.tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop: full left panel */}
                <div className="hidden lg:block lg:w-[360px] shrink-0 lg:border-r border-[var(--border)] p-5 space-y-3 playground-scroll overflow-y-auto">
                  <div className="opacity-0 playground-animate-in playground-stagger-1">
                    <p className="text-lg font-semibold mb-1">Hear Mosh in Action</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Choose a scenario to see how Mosh handles real conversations.</p>
                  </div>
                  <div className="space-y-2 mt-4">
                    {useCases.map((u, i) => (
                      <button
                        key={u.id}
                        onClick={() => switchCase(u.id)}
                        className={`opacity-0 playground-animate-in playground-stagger-${Math.min(i + 2, 5)} w-full text-left p-3.5 rounded-xl border cursor-pointer transition-all ${
                          activeCase === u.id
                            ? "border-[var(--accent)]/50 bg-[var(--accent)]/5"
                            : "border-[var(--border)] hover:border-[var(--accent)]/20 hover:-translate-y-0.5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <SoundwaveIcon color={useCaseColors[u.id] || "bg-violet-500"} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{u.tab}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <CountryFlag code={u.country} size={14} />
                              <span className="text-xs text-[var(--muted-foreground)]">{u.lang}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">{u.title}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transcript panel */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Header */}
                  <div className="px-4 sm:px-5 py-3 border-b border-[var(--border)] opacity-0 playground-animate-in playground-stagger-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs sm:text-sm font-medium text-emerald-400">Live Call</span>
                        <span className="hidden sm:inline text-xs text-[var(--muted-foreground)]">&middot;</span>
                        <div className="hidden sm:flex items-center gap-1.5">
                          <CountryFlag code={uc.country} size={14} />
                          <span className="text-xs text-[var(--muted-foreground)]">{uc.bizName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowTranslation(!showTranslation)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            showTranslation
                              ? "bg-[var(--accent)] text-white"
                              : "bg-[var(--accent)]/10 text-[var(--accent)]"
                          }`}
                        >
                          <Languages className="w-3.5 h-3.5" />
                          {showTranslation ? "Original" : "English"}
                        </button>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--card-hover)] text-[var(--muted-foreground)] font-mono hidden sm:inline">{uc.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transcript content */}
                  <div className="flex-1 p-4 sm:p-6 playground-scroll overflow-y-auto">
                    {uc.transcript ? (
                      <div className="space-y-5 sm:space-y-6">
                        {uc.transcript.map((line, i) => (
                          <div key={i} className={`flex gap-2.5 sm:gap-3 opacity-0 playground-animate-in playground-stagger-${Math.min(i + 1, 5)}`}>
                            {line.speaker === "moshi" ? (
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-white shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #7c5cfc, #c084fc)" }}>M</div>
                            ) : (
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-emerald-400 shrink-0 mt-0.5">B</div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`text-xs font-semibold ${line.speaker === "moshi" ? "text-[var(--accent)]" : "text-emerald-400"}`}>
                                  {line.speaker === "moshi" ? "Mosh" : uc.bizName}
                                </p>
                                <span className="text-[10px] text-[var(--muted)] font-mono">{line.ts}</span>
                              </div>
                              <p className="text-sm text-[var(--foreground)]/90 leading-relaxed">{showTranslation ? line.text : line.en}</p>
                              {!showTranslation && (
                                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">{line.text}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Outcome bar */}
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[var(--border)] bg-emerald-500/5 opacity-0 playground-animate-in playground-stagger-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs sm:text-sm text-emerald-400 font-semibold">{uc.outcome}</span>
                    </div>
                  </div>

                  {/* What user typed */}
                  <div className="px-4 sm:px-6 py-3 border-t border-[var(--border)] bg-[var(--background)]/50 opacity-0 playground-animate-in playground-stagger-5">
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                      <strong className="text-[var(--foreground)]">User typed:</strong> &quot;{uc.userTyped}&quot;
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ─── HOW MOSHI CALLS TAB ─── */}
            {activeTab === "how-it-calls" && (
              <div className="flex flex-col lg:flex-row lg:min-h-[480px]">
                {/* Mobile: compact header */}
                <div className="lg:hidden p-4 border-b border-[var(--border)]">
                  <p className="text-base font-semibold">How a Mosh call works</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">Each call follows a structured flow for the best outcome.</p>
                </div>

                {/* Desktop: full left panel */}
                <div className="hidden lg:block lg:w-[360px] shrink-0 lg:border-r border-[var(--border)] p-5">
                  <div className="opacity-0 playground-animate-in playground-stagger-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded bg-[var(--accent)]/10 flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5 text-[var(--accent)]" />
                      </div>
                      <span className="text-xs uppercase tracking-wider text-[var(--muted)]">Call Flow</span>
                    </div>
                    <p className="text-lg font-semibold mt-3">How a Mosh call works</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">Each call follows a structured flow to ensure the best outcome.</p>
                  </div>
                  <div className="mt-5 border-t border-[var(--border)] pt-4 opacity-0 playground-animate-in playground-stagger-2">
                    <div className="p-3.5 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-semibold">Real-time phone call</span>
                      </div>
                      <p className="text-xs text-[var(--muted)]">Mosh dials the number and has a live conversation in the local language</p>
                    </div>
                  </div>
                </div>

                {/* Flow visualization */}
                <div className="flex-1 p-4 sm:p-6 playground-scroll overflow-y-auto">
                  <div className="space-y-0">
                    {[
                      { icon: "⚙️", title: "Task Analysis", desc: "Mosh parses your request, identifies the business, language, and objective. It builds a culturally-aware conversation plan." },
                      { icon: "👋", title: "Greeting & Introduction", desc: "\"すみません、お忙しいところ失礼します。クライアントの代わりにお電話しています。\" — Mosh introduces itself politely in the local language." },
                      { icon: "💬", title: "Conversation Flow", desc: "Mosh follows the conversation naturally — answering questions, providing details, and adapting to the business's responses in real-time." },
                      { icon: "✅", title: "Confirmation & Wrap-up", desc: "Mosh confirms all details (date, time, name, etc.), thanks the business, and ends the call politely." },
                      { icon: "📋", title: "Results Delivered", desc: "Full transcript, summary, action items, and next steps — delivered to your dashboard instantly." },
                    ].map((step, i) => (
                      <div key={i} className={`opacity-0 playground-animate-in playground-stagger-${Math.min(i + 1, 5)}`}>
                        <div className="flex gap-4 py-4">
                          <div className="flex flex-col items-center">
                            <div className="w-11 h-11 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-xl shrink-0">
                              {step.icon}
                            </div>
                            {i < 4 && <div className="w-px flex-1 bg-[var(--border)] mt-2" />}
                          </div>
                          <div className="pb-2">
                            <p className="text-base font-semibold">{step.title}</p>
                            <p className="text-sm text-[var(--muted-foreground)] mt-1 leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── LANGUAGES TAB ─── */}
            {activeTab === "languages" && (
              <div className="flex flex-col lg:flex-row lg:min-h-[480px]">
                {/* Mobile: compact header */}
                <div className="lg:hidden p-4 border-b border-[var(--border)]">
                  <p className="text-base font-semibold">10+ languages supported</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">Native-level fluency with culturally appropriate tone.</p>
                </div>

                {/* Desktop: full left panel */}
                <div className="hidden lg:block lg:w-[360px] shrink-0 lg:border-r border-[var(--border)] p-5">
                  <div className="opacity-0 playground-animate-in playground-stagger-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded bg-[var(--accent)]/10 flex items-center justify-center">
                        <Globe className="w-3.5 h-3.5 text-[var(--accent)]" />
                      </div>
                      <span className="text-xs uppercase tracking-wider text-[var(--muted)]">Languages</span>
                    </div>
                    <p className="text-lg font-semibold mt-3">10+ languages supported</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">Mosh speaks each language fluently with culturally appropriate tone and etiquette.</p>
                  </div>
                  <div className="mt-5 border-t border-[var(--border)] pt-4 opacity-0 playground-animate-in playground-stagger-2">
                    <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-3">Capabilities</p>
                    <div className="space-y-2.5">
                      {["Native-level fluency", "Cultural etiquette", "Business formality", "Regional dialects"].map((cap, i) => (
                        <div key={cap} className={`flex items-center gap-2 text-sm text-[var(--muted-foreground)] opacity-0 playground-animate-in playground-stagger-${Math.min(i + 3, 5)}`}>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {cap}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Language grid */}
                <div className="flex-1 p-4 sm:p-6 playground-scroll overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: "Japanese", native: "日本語", greeting: "もしもし", code: "JP" },
                      { name: "Korean", native: "한국어", greeting: "여보세요", code: "KR" },
                      { name: "Mandarin", native: "中文", greeting: "你好", code: "CN" },
                      { name: "French", native: "Français", greeting: "Bonjour", code: "FR" },
                      { name: "Spanish", native: "Español", greeting: "Hola", code: "ES" },
                      { name: "German", native: "Deutsch", greeting: "Hallo", code: "DE" },
                      { name: "Italian", native: "Italiano", greeting: "Ciao", code: "IT" },
                      { name: "Thai", native: "ไทย", greeting: "สวัสดี", code: "TH" },
                      { name: "Portuguese", native: "Português", greeting: "Olá", code: "BR" },
                      { name: "English", native: "English", greeting: "Hello", code: "US" },
                    ].map((lang, i) => (
                      <div
                        key={lang.code}
                        className={`flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/20 transition-all opacity-0 playground-animate-in`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <span className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center"><CountryFlag code={lang.code} size={24} /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{lang.name}</p>
                            <span className="text-xs text-[var(--muted)]">{lang.native}</span>
                          </div>
                          <p className="text-sm text-[var(--accent)]">&ldquo;{lang.greeting}&rdquo;</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── RESULTS TAB ─── */}
            {activeTab === "results" && (
              <div className="flex flex-col lg:flex-row lg:min-h-[480px]">
                {/* Mobile: compact header */}
                <div className="lg:hidden p-4 border-b border-[var(--border)]">
                  <p className="text-base font-semibold">What you get after every task</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Transcript", "Summary", "Action items", "Recording"].map((item) => (
                      <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">{item}</span>
                    ))}
                  </div>
                </div>

                {/* Desktop: full left panel */}
                <div className="hidden lg:block lg:w-[360px] shrink-0 lg:border-r border-[var(--border)] p-5">
                  <div className="opacity-0 playground-animate-in playground-stagger-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded bg-[var(--accent)]/10 flex items-center justify-center">
                        <BarChart3 className="w-3.5 h-3.5 text-[var(--accent)]" />
                      </div>
                      <span className="text-xs uppercase tracking-wider text-[var(--muted)]">Results</span>
                    </div>
                    <p className="text-lg font-semibold mt-3">What you get after every task</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">Every call produces a detailed report delivered to your dashboard.</p>
                  </div>
                  <div className="mt-5 border-t border-[var(--border)] pt-4 opacity-0 playground-animate-in playground-stagger-2">
                    <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-3">Included in every task</p>
                    <div className="space-y-2.5">
                      {["Full transcript", "Summary & outcome", "Action items", "Next steps", "Recording (calls)"].map((item, i) => (
                        <div key={item} className={`flex items-center gap-2 text-sm text-[var(--muted-foreground)] opacity-0 playground-animate-in playground-stagger-${Math.min(i + 3, 5)}`}>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sample result */}
                <div className="flex-1 p-4 sm:p-6 playground-scroll overflow-y-auto">
                  <div className="space-y-4">
                    {/* Sample result card */}
                    <div className="rounded-xl border border-[var(--border)] overflow-hidden opacity-0 playground-animate-in playground-stagger-1">
                      <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-2 bg-[var(--background)]/50">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="text-sm font-medium">Completed — Restaurant Reservation</span>
                        <span className="ml-auto text-xs text-[var(--muted)]">2 min ago</span>
                      </div>
                      <div className="p-5 space-y-5">
                        <div className="opacity-0 playground-animate-in playground-stagger-2">
                          <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1.5">Summary</p>
                          <p className="text-sm text-[var(--foreground)] leading-relaxed">Successfully booked a table for 2 at Sushi Tanaka, counter seats, Friday at 7pm under the name Sarah.</p>
                        </div>
                        <div className="opacity-0 playground-animate-in playground-stagger-3">
                          <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1.5">Action Items</p>
                          <div className="space-y-2">
                            {["Arrive by 6:55pm", "Ask for counter seat reservation under Sarah", "No deposit required"].map((item) => (
                              <div key={item} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="opacity-0 playground-animate-in playground-stagger-4">
                          <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1.5">Details</p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                              <span className="text-xs text-[var(--muted)]">Language</span>
                              <p className="font-medium mt-0.5">Japanese</p>
                            </div>
                            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                              <span className="text-xs text-[var(--muted)]">Duration</span>
                              <p className="font-medium mt-0.5">1m 42s</p>
                            </div>
                            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                              <span className="text-xs text-[var(--muted)]">Outcome</span>
                              <p className="font-medium text-emerald-400 mt-0.5">Success</p>
                            </div>
                            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                              <span className="text-xs text-[var(--muted)]">Credits</span>
                              <p className="font-medium mt-0.5">1 credit</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom disclaimer bar */}
          <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--background)]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Info className="w-4 h-4 shrink-0" />
              <span>This is a simplified demo. Full functionality available after sign-up.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--muted-foreground)]">Ready to try it?</span>
              <Link href="/register">
                <Button size="sm" className="text-xs h-8">
                  Try Mosh Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)] mb-4 font-medium">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything you need to know
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
                aria-label={faq.q}
                className="flex items-center justify-between w-full px-6 py-5 text-left cursor-pointer"
              >
                <span className="text-sm font-semibold pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[var(--muted)] shrink-0 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 -mt-1">
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ───

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <MoshLogo size="lg" />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="md">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="md">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO (includes social proof ticker) ─── */}
      <HeroDemo />

      {/* ─── DEMO / PLAYGROUND ─── */}
      <div id="demo">
        <Playground />
      </div>

      {/* ─── STATS ─── */}
      <section className="py-10 px-6 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { value: "2,400+", label: "Tasks completed" },
            { value: "10+", label: "Languages" },
            { value: "99.8%", label: "Success rate" },
            { value: "< 3 min", label: "Avg. task time" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── LANGUAGE MARQUEE ─── */}
      <LanguageMarquee />

      {/* ─── PROCESS ─── */}
      <ProcessSection />

      {/* ─── FEATURES ─── */}
      <section className="py-32 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em]">
              Stop losing hours<br /><span className="gradient-text">to language barriers.</span>
            </h2>
          </div>

          {/* Bento grid — 2 large + 3 small */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Large card 1 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[var(--accent)]/10 to-transparent border border-[var(--accent)]/20">
              <Phone className="w-8 h-8 text-[var(--accent)] mb-4" />
              <h3 className="text-xl font-bold mb-2">Real phone calls</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs">Not a chatbot. Mosh dials the number and has a live conversation with a real person.</p>
            </div>
            {/* Large card 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
              <Languages className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">10+ languages</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs">Japanese, Korean, French, Spanish, Mandarin, German, Italian, Thai, Portuguese & more.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {/* Small card 1 */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-white/[0.03]">
              <FileText className="w-6 h-6 text-[var(--accent)] mb-3" />
              <h3 className="text-sm font-bold">Full transcript</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Every word, translated to English.</p>
            </div>
            {/* Small card 2 */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-white/[0.03]">
              <Sparkles className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="text-sm font-bold">Culturally fluent</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Local etiquette, not just translation.</p>
            </div>
            {/* Small card 3 */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-white/[0.03]">
              <Shield className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="text-sm font-bold">You stay in control</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Review the plan before Mosh calls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em]">
              They couldn&apos;t make the call.<br /><span className="gradient-text">Now they don&apos;t have to.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-7 bg-white/[0.04] border-white/[0.08]">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c5cfc, #c084fc)" }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-[var(--muted)]">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-32 px-6 bg-white/[0.02] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,92,252,0.06) 0%, transparent 60%)" }} />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em]">
              Try it free.<br /><span className="gradient-text">No credit card needed.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* Explorer — Free */}
            <div className="p-7 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex flex-col">
              <p className="text-lg font-bold">Explorer</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Try Mosh out</p>
              <div className="mt-5 mb-5">
                <p className="text-4xl font-bold">Free</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">3 tasks / month</p>
              </div>
              <div className="space-y-2.5 text-left flex-1">
                {[
                  "Phone calls in 10+ languages",
                  "Call transcript & recording",
                  "English translation",
                  "Summary with action items",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                    <CheckCircle className="w-3.5 h-3.5 text-[var(--muted)] shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="block mt-6">
                <Button variant="secondary" className="w-full h-11 text-sm">
                  Get started free
                </Button>
              </Link>
            </div>

            {/* Member — $19/mo (highlighted, taller) */}
            <div className="p-8 rounded-2xl border-2 border-[var(--accent)]/50 relative flex flex-col md:-mt-4 md:mb-[-16px] shadow-2xl shadow-[var(--accent)]/20" style={{ background: "linear-gradient(180deg, rgba(124,92,252,0.12) 0%, rgba(124,92,252,0.03) 100%)" }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-white" style={{ background: "linear-gradient(135deg, #7c5cfc, #c084fc)" }}>
                Most popular
              </div>
              <p className="text-xl font-bold mt-1">Member</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">For expats, travelers & remote workers</p>
              <div className="mt-5 mb-6">
                <p className="text-5xl font-bold">
                  $19<span className="text-base font-normal text-[var(--muted)]">/mo</span>
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">15 tasks / month</p>
              </div>
              <div className="space-y-3 text-left flex-1">
                {[
                  "Everything in Explorer",
                  "Priority call queue — faster results",
                  "Cultural briefing for every call",
                  "Chat support",
                  "Rollover unused tasks (up to 5)",
                  "Detailed call analytics",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm text-[var(--foreground)]/80">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="block mt-8">
                <Button variant="primary" className="w-full h-12 text-sm font-semibold shadow-lg shadow-[var(--accent)]/25">
                  Start 7-day free trial
                </Button>
              </Link>
            </div>

            {/* Global — $79/mo */}
            <div className="p-8 rounded-2xl border border-white/[0.1] bg-white/[0.05] flex flex-col">
              <p className="text-lg font-bold">Global</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">For businesses & power users</p>
              <div className="mt-5 mb-6">
                <p className="text-4xl font-bold">
                  $79<span className="text-base font-normal text-[var(--muted)]">/mo</span>
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">50 tasks / month</p>
              </div>
              <div className="space-y-3 text-left flex-1">
                {[
                  "Everything in Member",
                  "Fastest processing — skip the queue",
                  "Priority support (< 1hr response)",
                  "Team dashboard (coming soon)",
                  "Bulk task scheduling",
                  "Custom call scripts",
                  "Dedicated account manager",
                  "API access (coming soon)",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm text-[var(--muted-foreground)]">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/dashboard/plans" className="block mt-8">
                <Button variant="secondary" className="w-full h-12 text-sm font-semibold">
                  Choose Global
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <FAQSection />

      {/* ─── CTA ─── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(124,92,252,0.1) 0%, transparent 55%)" }} />
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em] leading-tight">
            Stop stressing.<br />
            <span className="gradient-text">Start calling.</span>
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] mt-6 max-w-lg mx-auto">
            Book a restaurant in Tokyo. Schedule a doctor in Seoul. Dispute a bill in Madrid.
            Mosh makes the call — you get the results.
          </p>
          <Link href="/register" className="mt-10 inline-block">
            <Button size="lg" className="text-base px-10 h-14 shadow-xl shadow-[var(--accent)]/25 rounded-xl">
              Start for free
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <p className="text-sm text-[var(--muted)] mt-4">
            3 free tasks &middot; No credit card &middot; Set up in 30 seconds
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[var(--border)] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <MoshLogo size="sm" />
              <p className="text-xs text-[var(--muted)] mt-3 leading-relaxed max-w-[200px]">
                Phone calls in any language, handled for you.
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-4 font-medium">Product</p>
              <div className="space-y-3">
                <Link href="/dashboard/new-task" className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">New Task</Link>
                <Link href="/dashboard/plans" className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Pricing</Link>
                <Link href="#demo" className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Demo</Link>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-4 font-medium">Account</p>
              <div className="space-y-3">
                <Link href="/login" className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Sign In</Link>
                <Link href="/register" className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Register</Link>
                <Link href="/dashboard/settings" className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Settings</Link>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-4 font-medium">Support</p>
              <div className="space-y-3">
                <a href="mailto:hello@mosh.app" className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Contact</a>
                <Link href="/privacy" className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Privacy</Link>
                <Link href="/terms" className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Terms</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--muted)]">
              &copy; {new Date().getFullYear()} Mosh. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
              <Link href="/privacy" className="hover:text-[var(--muted-foreground)] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[var(--muted-foreground)] transition-colors">Terms</Link>
              <a href="mailto:hello@mosh.app" className="hover:text-[var(--muted-foreground)] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
