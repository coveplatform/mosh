"use client";

import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
  label?: string;
  value: string;
  onChange: (time: string) => void;
  openingHours?: string | null;
  lunchService?: boolean;
  dinnerService?: boolean;
}

interface TimeSlot {
  value: string;
  label: string;
  period: "lunch" | "dinner" | "other";
}

function generateTimeSlots(
  openingHours?: string | null,
  lunch?: boolean,
  dinner?: boolean
): TimeSlot[] {
  // Default slots if no hours info
  const slots: TimeSlot[] = [];

  // Try to parse opening hours for smarter slots
  const hasLunch = lunch !== false;
  const hasDinner = dinner !== false;

  if (hasLunch) {
    for (let h = 11; h <= 14; h++) {
      for (const m of ["00", "30"]) {
        if (h === 14 && m === "30") continue;
        const hour12 = h > 12 ? h - 12 : h;
        const ampm = h >= 12 ? "PM" : "AM";
        slots.push({
          value: `${h}:${m}`,
          label: `${hour12}:${m} ${ampm}`,
          period: "lunch",
        });
      }
    }
  }

  if (hasDinner) {
    for (let h = 17; h <= 21; h++) {
      for (const m of ["00", "30"]) {
        if (h === 21 && m === "30") continue;
        const hour12 = h > 12 ? h - 12 : h;
        const ampm = "PM";
        slots.push({
          value: `${h}:${m}`,
          label: `${hour12}:${m} ${ampm}`,
          period: "dinner",
        });
      }
    }
  }

  // If neither, show all reasonable times
  if (!hasLunch && !hasDinner) {
    for (let h = 10; h <= 22; h++) {
      for (const m of ["00", "30"]) {
        if (h === 22 && m === "30") continue;
        const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const ampm = h >= 12 ? "PM" : "AM";
        slots.push({
          value: `${h}:${m}`,
          label: `${hour12}:${m} ${ampm}`,
          period: "other",
        });
      }
    }
  }

  return slots;
}

export function TimePicker({ label, value, onChange, openingHours, lunchService, dinnerService }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const slots = generateTimeSlots(openingHours, lunchService, dinnerService);
  const lunchSlots = slots.filter((s) => s.period === "lunch");
  const dinnerSlots = slots.filter((s) => s.period === "dinner");
  const otherSlots = slots.filter((s) => s.period === "other");
  const hasSections = lunchSlots.length > 0 || dinnerSlots.length > 0;

  const selectedSlot = slots.find((s) => s.value === value);
  const displayValue = selectedSlot?.label || value || "";

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-left cursor-pointer hover:border-[var(--accent)]/50 transition-colors"
      >
        <Clock className="w-4 h-4 text-[var(--muted)]" />
        <span className={displayValue ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
          {displayValue || "Select time"}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl w-[240px] max-h-[320px] overflow-y-auto">
          {openingHours && (
            <div className="px-3 pt-2.5 pb-1.5 border-b border-[var(--border)]">
              <p className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {openingHours}
              </p>
            </div>
          )}

          {hasSections ? (
            <>
              {lunchSlots.length > 0 && (
                <div className="p-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] px-2 py-1">Lunch</p>
                  <div className="grid grid-cols-2 gap-1">
                    {lunchSlots.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => { onChange(s.value); setOpen(false); }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          value === s.value
                            ? "bg-[var(--accent)] text-black"
                            : "hover:bg-[var(--background)] text-[var(--foreground)]"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {dinnerSlots.length > 0 && (
                <div className="p-1.5 border-t border-[var(--border)]">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] px-2 py-1">Dinner</p>
                  <div className="grid grid-cols-2 gap-1">
                    {dinnerSlots.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => { onChange(s.value); setOpen(false); }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          value === s.value
                            ? "bg-[var(--accent)] text-black"
                            : "hover:bg-[var(--background)] text-[var(--foreground)]"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-1.5">
              <div className="grid grid-cols-2 gap-1">
                {otherSlots.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => { onChange(s.value); setOpen(false); }}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      value === s.value
                        ? "bg-[var(--accent)] text-black"
                        : "hover:bg-[var(--background)] text-[var(--foreground)]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
