"use client";

import { create } from "zustand";
import type { UnifiedPost, AISummaryData, PlatformHeat, Platform, FilterType } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";

const ITEMS_PER_PAGE = 30;

interface SearchStore {
  query: string;
  results: UnifiedPost[];
  filteredResults: UnifiedPost[];
  aiSummary: AISummaryData | null;
  platformHeat: PlatformHeat[];
  activePlatform: Platform | "all";
  activeFilter: FilterType | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  isLiveMode: boolean;
  searchHistory: string[];
  hasSearched: boolean;
  nextPageToken: string | null;
  currentPage: number;
  totalPages: number;

  setQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  setPage: (page: number) => void;
  loadMore: () => Promise<void>;
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

function computeTotalPages(filteredCount: number, hasMore: boolean): number {
  const fullPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);
  // If there are more results available from the API, add an extra page
  return hasMore ? fullPages + 1 : Math.max(1, fullPages);
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
  isLoadingMore: false,
  isLiveMode: false,
  searchHistory: [],
  hasSearched: false,
  nextPageToken: null,
  currentPage: 1,
  totalPages: 1,

  setQuery: (query) => set({ query }),

  performSearch: async (query: string) => {
    if (!query.trim()) return;

    set({ isLoading: true, query, hasSearched: true, nextPageToken: null, currentPage: 1 });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) throw new Error("Search API failed");
      
      const data = await response.json();
      
      const { activePlatform, activeFilter, searchHistory } = get();
      const newHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(0, 20);
      const filtered = filterResults(data.results, activePlatform, activeFilter);

      set({
        results: data.results,
        filteredResults: filtered,
        aiSummary: data.aiSummary,
        platformHeat: data.platformHeat,
        nextPageToken: data.nextPageToken,
        currentPage: 1,
        totalPages: computeTotalPages(filtered.length, !!data.nextPageToken),
        isLoading: false,
        searchHistory: newHistory,
      });
    } catch (error) {
      console.error("Search failed:", error);
      set({ isLoading: false });
    }
  },

  setPage: (page: number) => {
    const { filteredResults, nextPageToken, totalPages } = get();
    const startIndex = (page - 1) * ITEMS_PER_PAGE;

    // If we need more data and have a token, fetch more first
    if (startIndex >= filteredResults.length && nextPageToken) {
      set({ currentPage: page });
      get().loadMore();
    } else {
      set({ currentPage: Math.min(page, totalPages) });
    }

    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  loadMore: async () => {
    const { query, nextPageToken, results, activePlatform, activeFilter, isLoadingMore, currentPage } = get();
    if (!query.trim() || !nextPageToken || isLoadingMore) return;

    set({ isLoadingMore: true });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/search?q=${encodeURIComponent(query)}&pageToken=${encodeURIComponent(nextPageToken)}`
      );

      if (!response.ok) throw new Error("Fetch more search results failed");

      const data = await response.json();
      const newResults = [...results, ...data.results];
      const filtered = filterResults(newResults, activePlatform, activeFilter);

      set({
        results: newResults,
        filteredResults: filtered,
        nextPageToken: data.nextPageToken,
        totalPages: computeTotalPages(filtered.length, !!data.nextPageToken),
        isLoadingMore: false,
      });
    } catch (error) {
      console.error("Failed to load more results:", error);
      set({ isLoadingMore: false });
    }
  },

  setActivePlatform: (platform) => {
    const { results, activeFilter, nextPageToken } = get();
    const filtered = filterResults(results, platform, activeFilter);
    set({
      activePlatform: platform,
      filteredResults: filtered,
      currentPage: 1,
      totalPages: computeTotalPages(filtered.length, !!nextPageToken),
    });
  },

  setActiveFilter: (filter) => {
    const { results, activePlatform, nextPageToken } = get();
    const filtered = filterResults(results, activePlatform, filter);
    set({
      activeFilter: filter,
      filteredResults: filtered,
      currentPage: 1,
      totalPages: computeTotalPages(filtered.length, !!nextPageToken),
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
      isLoadingMore: false,
      hasSearched: false,
      nextPageToken: null,
      currentPage: 1,
      totalPages: 1,
    }),
}));
