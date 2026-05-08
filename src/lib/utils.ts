import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getDeepLink(platform: string, url: string): string {
  const schemes: Record<string, string> = {
    x: "twitter://",
    reddit: "reddit://",
    youtube: "youtube://",
    linkedin: "linkedin://",
    instagram: "instagram://",
    tiktok: "tiktok://",
    facebook: "fb://",
    threads: "barcelona://",
  };
  return schemes[platform] || url;
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    x: "#000000",
    reddit: "#FF4500",
    youtube: "#FF0000",
    linkedin: "#0A66C2",
    threads: "#000000",
    instagram: "#E4405F",
    tiktok: "#00F2EA",
    facebook: "#1877F2",
    medium: "#000000",
    hackernews: "#FF6600",
  };
  return colors[platform] || "#7c3aed";
}
