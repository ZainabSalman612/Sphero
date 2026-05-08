"use client";

import { SearchBar } from "@/components/search/SearchBar";
import { PlatformTabs } from "@/components/search/PlatformTabs";
import { SearchResults } from "@/components/search/SearchResults";
import { AISummary } from "@/components/ai/AISummary";
import { useSearchStore } from "@/stores/searchStore";

export default function SearchPage() {
  const { hasSearched } = useSearchStore();

  return (
    <div className="flex flex-col w-full h-full min-h-[calc(100vh-4rem)]">
      <div className="flex-1 w-full flex flex-col pt-8">
        <div className="px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
          <SearchBar />
        </div>
        
        {hasSearched && (
          <div className="flex-1 w-full bg-[var(--color-sphero-bg)]">
            <PlatformTabs />
            <div className="px-4 sm:px-6 lg:px-8 w-full">
              <AISummary />
            </div>
            <SearchResults />
          </div>
        )}
      </div>
    </div>
  );
}
