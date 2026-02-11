"use client";

import { useState, useRef, useEffect } from "react";
import { useCountry, countries, getFlagUrl, EXPLORER_COUNTRIES } from "@/lib/country-context";
import { ChevronDown, Lock } from "lucide-react";
import Link from "next/link";

export function CountrySelector({ compact = false, userPlan = "free" }: { compact?: boolean; userPlan?: string }) {
  const { selected, setSelected } = useCountry();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isExplorer = userPlan === "free";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card)]/80 transition-all cursor-pointer w-full"
      >
        <img src={getFlagUrl(selected.code, 40)} alt={selected.name} className="w-6 h-4 rounded-[2px] object-cover" />
        {!compact && (
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium truncate">{selected.name}</p>
            <p className="text-[10px] text-[var(--muted)] truncate">{selected.language}</p>
          </div>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden min-w-[220px]">
          <div className="p-2 border-b border-[var(--border)]">
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] px-2 py-1">
              Travelling in
            </p>
          </div>
          <div className="max-h-[320px] overflow-y-auto p-1">
            {countries.map((country) => {
              const locked = isExplorer && !EXPLORER_COUNTRIES.includes(country.key);
              return (
                <button
                  key={country.key}
                  onClick={() => {
                    if (!locked) {
                      setSelected(country);
                      setOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all ${
                    locked
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer"
                  } ${
                    selected.key === country.key
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : locked
                        ? ""
                        : "hover:bg-[var(--background)] text-[var(--foreground)]"
                  }`}
                  disabled={locked}
                >
                  <img src={getFlagUrl(country.code, 40)} alt={country.name} className="w-7 h-5 rounded-[2px] object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{country.name}</p>
                    <p className="text-[10px] text-[var(--muted)]">{country.language}</p>
                  </div>
                  {locked ? (
                    <Lock className="w-3 h-3 text-[var(--muted)]" />
                  ) : selected.key === country.key ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  ) : null}
                </button>
              );
            })}
          </div>
          {isExplorer && (
            <div className="p-2 border-t border-[var(--border)]">
              <Link href="/dashboard/plans">
                <p className="text-[10px] text-[var(--accent)] text-center hover:underline cursor-pointer">
                  Upgrade to unlock all countries
                </p>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
