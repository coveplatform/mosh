"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { useCountry } from "@/lib/country-context";
import {
  Phone,
  AlertCircle,
  Sparkles,
  Link2,
  Loader2,
  MapPin,
  Star,
  ExternalLink,
  Plus,
  UtensilsCrossed,
  Clock,
} from "lucide-react";

interface RestaurantData {
  name: string | null;
  phone: string | null;
  image: string | null;
  address: string | null;
  cuisine: string | null;
  priceRange: string | null;
  rating: string | null;
  source: string | null;
  openingHours: string | null;
  seatingTypes: string[];
  menuTypes: string[];
  lunchService: boolean;
  dinnerService: boolean;
  url: string;
}

const DEFAULT_SEATING = [
  { v: "no_preference", l: "Any" },
  { v: "counter", l: "Counter" },
  { v: "table", l: "Table" },
  { v: "private", l: "Private" },
  { v: "outdoor", l: "Outdoor" },
  { v: "tatami", l: "Tatami" },
  { v: "bar", l: "Bar" },
];

export default function NewCallPage() {
  const router = useRouter();
  const { selected: selectedCountry } = useCountry();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);

  // URL lookup
  const [urlInput, setUrlInput] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [preview, setPreview] = useState<RestaurantData | null>(null);

  // Form
  const [form, setForm] = useState({
    restaurantName: "",
    phone: "",
    country: selectedCountry.key,
    partySize: "2",
    date: "",
    dateFlexibility: "0",
    timePreference: "",
    seating: "no_preference",
    timeFlexibility: "30",
    timeDirection: "either",
    unavailableBehavior: "ask",
    menuChoice: "",
    occasion: "",
    dietary: "",
    specialRequests: "",
    bookingName: "",
    fallbackDate: "",
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, country: selectedCountry.key }));
  }, [selectedCountry.key]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // URL lookup
  const doLookup = async (url: string) => {
    setLookingUp(true);
    setLookupError("");
    try {
      const res = await fetch("/api/restaurant-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || "Could not look up restaurant");
      } else {
        setPreview(data);
        if (data.name) setForm((p) => ({ ...p, restaurantName: data.name }));
        if (data.phone) setForm((p) => ({ ...p, phone: data.phone }));
      }
    } catch {
      setLookupError("Couldn't reach that site. Enter details manually below.");
    }
    setLookingUp(false);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (pasted.startsWith("http://") || pasted.startsWith("https://")) {
      setUrlInput(pasted);
      setTimeout(() => doLookup(pasted), 50);
    }
  };

  // Dynamic seating options:
  // - If lookup found specific types → show "Any" + those types only
  // - If lookup ran but found nothing → just "Any" (agent will ask)
  // - If no lookup yet → show common defaults so user can pick
  const seatingOptions = preview
    ? preview.seatingTypes?.length
      ? [
          { v: "no_preference", l: "Any" },
          ...preview.seatingTypes.map((s) => ({
            v: s,
            l: s.charAt(0).toUpperCase() + s.slice(1),
          })),
        ]
      : [{ v: "no_preference", l: "Any" }]
    : DEFAULT_SEATING.slice(0, 5);

  // Validation
  const isValidPhone = /^\+\d{7,15}$/.test(form.phone.replace(/[\s\-()]/g, ""));
  const canSubmit = form.restaurantName && form.phone && isValidPhone && form.date && form.timePreference;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "restaurant_booking",
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create booking");
        setLoading(false);
        return;
      }
      router.push(`/dashboard/call/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Book a Restaurant</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Paste a link or enter details — we&apos;ll call in {selectedCountry.name === "United States" || selectedCountry.name === "United Kingdom" || selectedCountry.name === "Australia" ? "English" : "the local language"}.
        </p>
      </div>

      {/* URL Paste */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="url"
              placeholder="Paste restaurant link (Tabelog, Google Maps, Yelp...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => e.key === "Enter" && urlInput.trim() && doLookup(urlInput.trim())}
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all"
            />
          </div>
          {urlInput.trim() && !lookingUp && (
            <Button onClick={() => doLookup(urlInput.trim())} variant="outline" className="rounded-xl px-4">
              <Sparkles className="w-4 h-4" />
            </Button>
          )}
          {lookingUp && (
            <div className="flex items-center px-4">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
            </div>
          )}
        </div>
        {lookupError && (
          <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {lookupError}
          </p>
        )}
      </div>

      {/* Restaurant Preview */}
      {preview && (
        <Card className="border-[var(--accent)]/20 !p-0 overflow-hidden">
          <div className="flex">
            {preview.image && (
              <div className="w-24 sm:w-32 flex-shrink-0 bg-[var(--background)]">
                <img
                  src={preview.image}
                  alt={preview.name || ""}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold truncate">{preview.name}</h3>
                {preview.source && (
                  <span className="text-[10px] text-[var(--muted)] bg-[var(--background)] px-1.5 py-0.5 rounded flex-shrink-0">
                    {preview.source}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-[var(--muted-foreground)]">
                {preview.cuisine && <span>{preview.cuisine}</span>}
                {preview.priceRange && <span>{preview.priceRange}</span>}
                {preview.rating && (
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {preview.rating}
                  </span>
                )}
              </div>
              {preview.address && (
                <p className="text-[11px] text-[var(--muted)] mt-1 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0" /> {preview.address}
                </p>
              )}
              {preview.openingHours && (
                <p className="text-[11px] text-[var(--muted)] mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 flex-shrink-0" /> {preview.openingHours}
                </p>
              )}
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-[var(--accent)] mt-1.5 hover:underline"
              >
                View source <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Main Form */}
      <Card>
        <div className="space-y-4">
          {/* Restaurant + Phone + Booking Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Restaurant"
              placeholder="Restaurant name"
              value={form.restaurantName}
              onChange={(e) => update("restaurantName", e.target.value)}
            />
            <div>
              <Input
                label="Phone"
                placeholder="+81 3-1234-5678"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
              {form.phone && !isValidPhone && (
                <p className="text-[10px] text-red-400 mt-0.5">Needs + country code</p>
              )}
            </div>
          </div>

          <Input
            label="Booking name"
            placeholder="Name for the reservation"
            value={form.bookingName}
            onChange={(e) => update("bookingName", e.target.value)}
          />

          {/* Guests — pills */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Guests</label>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update("partySize", String(n))}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    form.partySize === String(n)
                      ? "bg-[var(--accent)] text-black"
                      : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--background)]/80 border border-[var(--border)]"
                  }`}
                >
                  {n}{n === 8 ? "+" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Date + Time — custom pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DatePicker
              label="Date"
              value={form.date}
              onChange={(d) => update("date", d)}
            />
            <TimePicker
              label="Time"
              value={form.timePreference}
              onChange={(t) => update("timePreference", t)}
              openingHours={preview?.openingHours}
              lunchService={preview?.lunchService}
              dinnerService={preview?.dinnerService}
            />
          </div>

          {/* Flexibility Controls */}
          {(form.date || form.timePreference) && (
            <div className="space-y-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              {/* Date Flexibility */}
              {form.date && (
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Date flexibility</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { v: "0", l: "This date only" },
                      { v: "1", l: "± 1 day" },
                      { v: "2", l: "± 2 days" },
                      { v: "3", l: "± 3 days" },
                      { v: "week", l: "Same week" },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => update("dateFlexibility", opt.v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          form.dateFlexibility === opt.v
                            ? "bg-[var(--accent)] text-black"
                            : "bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Flexibility */}
              {form.timePreference && (
                <>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Time flexibility</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { v: "0", l: "Exact time" },
                        { v: "30", l: "± 30 min" },
                        { v: "60", l: "± 1 hour" },
                        { v: "120", l: "± 2 hours" },
                      ].map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => update("timeFlexibility", opt.v)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                            form.timeFlexibility === opt.v
                              ? "bg-[var(--accent)] text-black"
                              : "bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
                          }`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.timeFlexibility !== "0" && (
                    <div>
                      <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Direction</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { v: "earlier", l: "Earlier only" },
                          { v: "later", l: "Later only" },
                          { v: "either", l: "Either way" },
                        ].map((opt) => (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() => update("timeDirection", opt.v)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                              form.timeDirection === opt.v
                                ? "bg-[var(--accent)] text-black"
                                : "bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
                            }`}
                          >
                            {opt.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Fallback behavior */}
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">If nothing available</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { v: "ask", l: "Ask what\u2019s available" },
                    { v: "decline", l: "Decline & report back" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => update("unavailableBehavior", opt.v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        form.unavailableBehavior === opt.v
                          ? "bg-[var(--accent)] text-black"
                          : "bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary line */}
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                {(() => {
                  const parts: string[] = [];
                  // Date summary
                  if (form.date) {
                    if (form.dateFlexibility === "0") {
                      parts.push("the selected date only");
                    } else if (form.dateFlexibility === "week") {
                      parts.push("any day the same week");
                    } else {
                      parts.push(`± ${form.dateFlexibility} day${form.dateFlexibility !== "1" ? "s" : ""}`);
                    }
                  }
                  // Time summary
                  if (form.timePreference) {
                    if (form.timeFlexibility === "0") {
                      parts.push(`${form.timePreference} exactly`);
                    } else {
                      const dir = form.timeDirection === "earlier" ? "earlier only"
                        : form.timeDirection === "later" ? "later only" : "either way";
                      parts.push(`± ${Number(form.timeFlexibility)} min (${dir})`);
                    }
                  }
                  const summary = `Mosh will accept: ${parts.join(", ")}.`;
                  const fallback = form.unavailableBehavior === "decline"
                    ? " If nothing fits, Mosh will politely decline."
                    : " If nothing fits, Mosh will ask what\u2019s available and report back.";
                  return summary + fallback;
                })()}
              </p>
            </div>
          )}

          {/* Seating — dynamic pills */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Seating</label>
            <div className="flex flex-wrap gap-1.5">
              {seatingOptions.map((s) => (
                <button
                  key={s.v}
                  type="button"
                  onClick={() => update("seating", s.v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    form.seating === s.v
                      ? "bg-[var(--accent)] text-black"
                      : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--background)]/80 border border-[var(--border)]"
                  }`}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>

          {/* Menu / Course — shown when restaurant has options */}
          {preview?.menuTypes && preview.menuTypes.length > 0 && (
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3 h-3" /> Menu / Course
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => update("menuChoice", "")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    !form.menuChoice
                      ? "bg-[var(--accent)] text-black"
                      : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--background)]/80 border border-[var(--border)]"
                  }`}
                >
                  Not sure / ask
                </button>
                {preview.menuTypes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => update("menuChoice", m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      form.menuChoice === m
                        ? "bg-[var(--accent)] text-black"
                        : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--background)]/80 border border-[var(--border)]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Expandable extras */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer w-full justify-center py-1"
      >
        <Plus className={`w-3.5 h-3.5 transition-transform ${showMore ? "rotate-45" : ""}`} />
        {showMore ? "Less options" : "Add dietary, occasion, special requests..."}
      </button>

      {showMore && (
        <Card className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Occasion"
              placeholder="Birthday, anniversary..."
              value={form.occasion}
              onChange={(e) => update("occasion", e.target.value)}
            />
            <Input
              label="Dietary needs"
              placeholder="Vegetarian, allergies..."
              value={form.dietary}
              onChange={(e) => update("dietary", e.target.value)}
            />
          </div>
          <Textarea
            label="Special requests"
            placeholder="Quiet table, high chair, specific course..."
            rows={2}
            value={form.specialRequests}
            onChange={(e) => update("specialRequests", e.target.value)}
          />
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        loading={loading}
        disabled={!canSubmit}
        size="lg"
        className="w-full"
      >
        <Phone className="w-4 h-4" />
        Book Restaurant
        <span className="text-xs opacity-60 ml-1">· 1 credit</span>
      </Button>
    </div>
  );
}
