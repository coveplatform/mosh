"use client";

import { SessionProvider } from "next-auth/react";
import { CountryProvider } from "@/lib/country-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CountryProvider>{children}</CountryProvider>
    </SessionProvider>
  );
}
