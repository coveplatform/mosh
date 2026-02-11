"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function DatePicker({ label, value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = value ? new Date(value + "T00:00:00") : null;
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectDate = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const displayValue = selected
    ? selected.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "";

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
        <Calendar className="w-4 h-4 text-[var(--muted)]" />
        <span className={displayValue ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
          {displayValue || "Select date"}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl p-3 w-[280px]">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-[var(--background)] cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="p-1 rounded-lg hover:bg-[var(--background)] cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-[var(--muted)] py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewYear, viewMonth, day);
              const isPast = date < today;
              const isSelected = selected && date.getTime() === selected.getTime();
              const isToday = date.getTime() === today.getTime();

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => selectDate(day)}
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? "bg-[var(--accent)] text-black"
                      : isToday
                        ? "border border-[var(--accent)]/50 text-[var(--accent)]"
                        : isPast
                          ? "text-[var(--muted)]/40 cursor-not-allowed"
                          : "text-[var(--foreground)] hover:bg-[var(--background)]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
