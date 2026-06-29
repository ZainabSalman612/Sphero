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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="masonry-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (filteredResults.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-[var(--color-sphero-accent)]/10 flex items-center justify-center mb-6">
          <Ghost className="w-12 h-12 text-[var(--color-sphero-text-muted)]" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--color-sphero-text)] mb-2">No results found</h3>
        <p className="text-[var(--color-sphero-text-secondary)] max-w-md">
          We couldn't find any discussions matching your criteria across the selected platforms.
        </p>
      </div>
    );
  }

  // Assign variants based on index and engagement
  const getVariant = (index: number, engagement: number): "large" | "medium" | "small" => {
    if (index % 5 === 0 && engagement > 1000) return "large";
    if (index % 3 === 0) return "medium";
    return "small";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="masonry-grid">
        {filteredResults.map((post, index) => (
          <ResultCard 
            key={post.id} 
            post={post} 
            index={index}
            variant={getVariant(index, post.engagement.likes + post.engagement.comments)}
          />
        ))}
      </div>
    </div>
  );
}
