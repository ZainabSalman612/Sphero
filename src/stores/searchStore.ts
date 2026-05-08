"use client";

import { create } from "zustand";
import type { UnifiedPost, AISummaryData, PlatformHeat, Platform, FilterType } from "@/lib/types";
import { generateMockPosts, generateMockAISummary, generateMockPlatformHeat } from "@/lib/mock-data";

interface SearchStore {
  query: string;
  results: UnifiedPost[];
  filteredResults: UnifiedPost[];
  aiSummary: AISummaryData | null;
  platformHeat: PlatformHeat[];
  activePlatform: Platform | "all";
  activeFilter: FilterType | null;
  isLoading: boolean;
  isLiveMode: boolean;
  searchHistory: string[];
  hasSearched: boolean;

  setQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  setActivePlatform: (platform: Platform | "all") => void;
  setActiveFilter: (filter: FilterType | null) => void;
  toggleLiveMode: () => void;
  clearSearch: () => void;
}

function filterResults(
  results: UnifiedPost[],
  platform: Platform | "all",
  filter: FilterType | null
): UnifiedPost[] {
  let filtered = platform === "all" ? results : results.filter((r) => r.platform === platform);

  if (filter) {
    switch (filter) {
      case "recent":
        filtered = [...filtered].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        break;
      case "viral":
        filtered = [...filtered].sort(
          (a, b) => b.engagement.likes + b.engagement.shares - (a.engagement.likes + a.engagement.shares)
        );
        break;
      case "controversial":
        filtered = [...filtered].sort((a, b) => b.engagement.comments - a.engagement.comments);
        break;
      case "videos":
        filtered = filtered.filter((r) => r.mediaType === "video");
        break;
      default:
        break;
    }
  }

  return filtered;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: "",
  results: [],
  filteredResults: [],
  aiSummary: null,
  platformHeat: [],
  activePlatform: "all",
  activeFilter: null,
  isLoading: false,
  isLiveMode: false,
  searchHistory: [],
  hasSearched: false,

  setQuery: (query) => set({ query }),

  performSearch: async (query: string) => {
    if (!query.trim()) return;

    set({ isLoading: true, query, hasSearched: true });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const results = generateMockPosts(query);
    const aiSummary = generateMockAISummary(query);
    const platformHeat = generateMockPlatformHeat(query);
    const { activePlatform, activeFilter, searchHistory } = get();

    const newHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(0, 20);

    set({
      results,
      filteredResults: filterResults(results, activePlatform, activeFilter),
      aiSummary,
      platformHeat,
      isLoading: false,
      searchHistory: newHistory,
    });
  },

  setActivePlatform: (platform) => {
    const { results, activeFilter } = get();
    set({
      activePlatform: platform,
      filteredResults: filterResults(results, platform, activeFilter),
    });
  },

  setActiveFilter: (filter) => {
    const { results, activePlatform } = get();
    set({
      activeFilter: filter,
      filteredResults: filterResults(results, activePlatform, filter),
    });
  },

  toggleLiveMode: () => set((state) => ({ isLiveMode: !state.isLiveMode })),

  clearSearch: () =>
    set({
      query: "",
      results: [],
      filteredResults: [],
      aiSummary: null,
      platformHeat: [],
      activePlatform: "all",
      activeFilter: null,
      isLoading: false,
      hasSearched: false,
    }),
}));
