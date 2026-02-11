"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CountryOption {
  key: string;
  name: string;
  language: string;
  code: string; // ISO 3166-1 alpha-2 for flag CDN
}

export const countries: CountryOption[] = [
  { key: "japan", name: "Japan", language: "Japanese", code: "JP" },
  { key: "korea", name: "South Korea", language: "Korean", code: "KR" },
  { key: "china", name: "China", language: "Chinese", code: "CN" },
  { key: "france", name: "France", language: "French", code: "FR" },
  { key: "italy", name: "Italy", language: "Italian", code: "IT" },
  { key: "spain", name: "Spain", language: "Spanish", code: "ES" },
  { key: "germany", name: "Germany", language: "German", code: "DE" },
  { key: "thailand", name: "Thailand", language: "Thai", code: "TH" },
  { key: "australia", name: "Australia", language: "English", code: "AU" },
  { key: "uk", name: "United Kingdom", language: "English", code: "GB" },
  { key: "usa", name: "United States", language: "English", code: "US" },
];

// Explorer (free) plan only gets these 3 countries
export const EXPLORER_COUNTRIES = ["japan", "france", "spain"];

export function getFlagUrl(code: string, size: number = 40): string {
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}

interface CountryContextType {
  selected: CountryOption;
  setSelected: (country: CountryOption) => void;
}

const CountryContext = createContext<CountryContextType | null>(null);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [selected, setSelectedState] = useState<CountryOption>(countries[0]);

  useEffect(() => {
    const stored = localStorage.getItem("mosh-country");
    if (stored) {
      const found = countries.find((c) => c.key === stored);
      if (found) setSelectedState(found);
    }
  }, []);

  const setSelected = (country: CountryOption) => {
    setSelectedState(country);
    localStorage.setItem("mosh-country", country.key);
  };

  return (
    <CountryContext.Provider value={{ selected, setSelected }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}
