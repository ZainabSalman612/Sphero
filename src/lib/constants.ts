import type { PlatformTab, FilterType } from "./types";

export const PLATFORM_TABS: PlatformTab[] = [
  { id: "all", label: "All", icon: "globe", count: 0, available: true },
  { id: "x", label: "X", icon: "twitter", count: 0, available: true },
  { id: "reddit", label: "Reddit", icon: "message-circle", count: 0, available: true },
  { id: "youtube", label: "YouTube", icon: "youtube", count: 0, available: true },
  { id: "linkedin", label: "LinkedIn", icon: "linkedin", count: 0, available: false },
  { id: "threads", label: "Threads", icon: "at-sign", count: 0, available: false },
  { id: "instagram", label: "Instagram", icon: "instagram", count: 0, available: false },
  { id: "tiktok", label: "TikTok", icon: "music", count: 0, available: false },
  { id: "facebook", label: "Facebook", icon: "facebook", count: 0, available: false },
  { id: "medium", label: "Medium", icon: "book-open", count: 0, available: true },
];

export const SMART_FILTERS: { id: FilterType; label: string; icon: string }[] = [
  { id: "recent", label: "Most Recent", icon: "clock" },
  { id: "viral", label: "Most Viral", icon: "trending-up" },
  { id: "informative", label: "Most Informative", icon: "book-open" },
  { id: "controversial", label: "Most Controversial", icon: "flame" },
  { id: "videos", label: "Videos", icon: "play" },
  { id: "news", label: "News", icon: "newspaper" },
  { id: "tutorials", label: "Tutorials", icon: "graduation-cap" },
  { id: "professional", label: "Professional", icon: "briefcase" },
];

export const SEARCH_PLACEHOLDERS = [
  "Search what the internet is saying…",
  "AI replacing developers",
  "Best frameworks for 2025",
  "Remote work trends",
  "Latest startup funding",
  "Climate change discussions",
  "Web3 and blockchain opinions",
  "Tech layoffs sentiment",
];

export const API_BASE_URL = "";
