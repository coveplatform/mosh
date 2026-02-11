import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCredits(credits: number): string {
  return credits.toString();
}

export function getCreditCost(tier: string): number {
  switch (tier) {
    case "simple":
      return 1;
    case "booking":
      return 2;
    case "complex":
      return 3;
    default:
      return 1;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "text-amber-400";
    case "in_progress":
      return "text-blue-400";
    case "completed":
      return "text-emerald-400";
    case "failed":
      return "text-red-400";
    case "cancelled":
      return "text-zinc-500";
    default:
      return "text-zinc-400";
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-400/10 border-amber-400/20";
    case "in_progress":
      return "bg-blue-400/10 border-blue-400/20";
    case "completed":
      return "bg-emerald-400/10 border-emerald-400/20";
    case "failed":
      return "bg-red-400/10 border-red-400/20";
    case "cancelled":
      return "bg-zinc-400/10 border-zinc-400/20";
    default:
      return "bg-zinc-400/10 border-zinc-400/20";
  }
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
