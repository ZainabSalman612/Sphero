"use client";

import { useSearchStore } from "@/stores/searchStore";
import { ResultCard } from "./ResultCard";
import { motion } from "framer-motion";
import { Ghost, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { SkeletonCard } from "../shared/SkeletonCard";

const ITEMS_PER_PAGE = 30;

export function SearchResults() {
  const {
    filteredResults,
    isLoading,
    isLoadingMore,
    hasSearched,
    currentPage,
    totalPages,
    setPage,
  } = useSearchStore();

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

  // Paginate: slice results for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageResults = filteredResults.slice(startIndex, endIndex);

  // Assign variants based on index and engagement
  const getVariant = (index: number, engagement: number): "large" | "medium" | "small" => {
    if (index % 5 === 0 && engagement > 1000) return "large";
    if (index % 3 === 0) return "medium";
    return "small";
  };

  // Build page numbers to display
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Loading overlay for page transitions */}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-sphero-accent-light)]" />
          <span className="ml-3 text-[var(--color-sphero-text-secondary)]">Loading more results...</span>
        </div>
      )}

      {!isLoadingMore && (
        <>
          {/* Results count & page info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-[var(--color-sphero-text-muted)]">
              Showing {startIndex + 1}–{Math.min(endIndex, filteredResults.length)} of {filteredResults.length} results
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-[var(--color-sphero-text-muted)]">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          {/* Results grid */}
          <div className="masonry-grid">
            {pageResults.map((post, index) => (
              <ResultCard
                key={post.id}
                post={post}
                index={index}
                variant={getVariant(index, post.engagement.likes + post.engagement.comments)}
              />
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center mt-14 mb-4 gap-2" aria-label="Pagination">
              {/* Previous button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="glass px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-sm font-medium text-[var(--color-sphero-text-secondary)] hover:text-white hover:bg-white/10 transition-all border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </motion.button>

              {/* Page numbers */}
              <div className="flex items-center gap-1.5">
                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={`dots-${idx}`}
                      className="w-10 h-10 flex items-center justify-center text-[var(--color-sphero-text-muted)] text-sm"
                    >
                      ···
                    </span>
                  ) : (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        currentPage === page
                          ? "bg-[var(--color-sphero-accent)] text-white shadow-lg shadow-[var(--color-sphero-accent)]/30"
                          : "glass text-[var(--color-sphero-text-secondary)] hover:text-white hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {page}
                    </motion.button>
                  )
                )}
              </div>

              {/* Next button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="glass px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-sm font-medium text-[var(--color-sphero-text-secondary)] hover:text-white hover:bg-white/10 transition-all border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
