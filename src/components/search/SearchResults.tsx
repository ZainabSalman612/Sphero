"use client";

import { useSearchStore } from "@/stores/searchStore";
import { ResultCard } from "./ResultCard";
import { motion } from "framer-motion";
import { Ghost, Loader2 } from "lucide-react";
import { SkeletonCard } from "../shared/SkeletonCard";

export function SearchResults() {
  const { filteredResults, isLoading, hasSearched } = useSearchStore();

  if (!hasSearched) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (filteredResults.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Ghost className="w-12 h-12 text-[var(--color-sphero-text-muted)]" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
        <p className="text-[var(--color-sphero-text-secondary)] max-w-md">
          We couldn't find any discussions matching your criteria across the selected platforms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {filteredResults.map((post, index) => (
        <ResultCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
