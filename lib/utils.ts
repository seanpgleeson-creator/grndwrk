import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateRelative(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(date);
}

export type CmfWeights = {
  domain: number;
  stage: number;
  scope: number;
  strategic: number;
  narrative: number;
};

export type CmfBreakdown = {
  domain: number;
  stage: number;
  scope: number;
  strategic: number;
  narrative: number;
};

export function calcCmfScore(
  breakdown: CmfBreakdown,
  weights: CmfWeights,
): number {
  const keys = [
    "domain",
    "stage",
    "scope",
    "strategic",
    "narrative",
  ] as const;
  const raw = keys.reduce(
    (sum, k) => sum + (breakdown[k] * weights[k]) / 100,
    0,
  );
  return Math.round(raw * 10) / 10;
}

export function cmfRecommendation(
  score: number,
): "prioritize" | "proceed" | "marginal" | "skip" {
  if (score >= 8) return "prioritize";
  if (score >= 6) return "proceed";
  if (score >= 4) return "marginal";
  return "skip";
}

export function cmfScoreColor(score: number): string {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-amber-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

export function cmfScoreBg(score: number): string {
  if (score >= 8) return "bg-green-400/10 text-green-400 border-green-400/20";
  if (score >= 6) return "bg-amber-400/10 text-amber-400 border-amber-400/20";
  if (score >= 4)
    return "bg-orange-400/10 text-orange-400 border-orange-400/20";
  return "bg-red-400/10 text-red-400 border-red-400/20";
}

export function isOlderThan180Days(date: Date | string): boolean {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  return diffMs > 180 * 24 * 60 * 60 * 1000;
}

export function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
