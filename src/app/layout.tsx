import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mosh — Phone Calls in Any Language",
  description:
    "Book appointments, make reservations, and handle tasks across languages and timezones. Mosh calls the business, speaks the local language, and reports back.",
  metadataBase: new URL("https://mosh.app"),
  openGraph: {
    title: "Mosh — Phone Calls in Any Language",
    description:
      "Type what you need in English. Mosh calls the business in the local language and reports back.",
    siteName: "Mosh",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mosh — Phone Calls in Any Language",
    description:
      "Type what you need in English. Mosh calls the business in the local language and reports back.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased font-[var(--font-inter)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
