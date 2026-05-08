"use client";

import { create } from "zustand";

interface UIStore {
  isSidebarOpen: boolean;
  isAISummaryExpanded: boolean;
  toggleSidebar: () => void;
  toggleAISummary: () => void;
  setAISummaryExpanded: (expanded: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: false,
  isAISummaryExpanded: true,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleAISummary: () => set((state) => ({ isAISummaryExpanded: !state.isAISummaryExpanded })),
  setAISummaryExpanded: (expanded) => set({ isAISummaryExpanded: expanded }),
}));
