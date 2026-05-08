"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useSearchStore } from "@/stores/searchStore";
import { SEARCH_PLACEHOLDERS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function SearchBar() {
  const { query, setQuery, performSearch, isLoading, hasSearched } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Cycle placeholders
  useEffect(() => {
    if (localQuery || hasSearched) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [localQuery, hasSearched]);

  // Sync with store
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setQuery(localQuery);
      performSearch(localQuery);
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto transition-all duration-700 ease-in-out z-20 relative",
        hasSearched ? "mt-4 mb-8" : "mt-[20vh] mb-12"
      )}
    >
      {!hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 gradient-text">
            Sphero Intelligence
          </h1>
          <p className="text-xl text-[var(--color-sphero-text-secondary)]">
            Search once. Discover what the entire internet is saying.
          </p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="relative group">
        <div
          className={cn(
            "absolute -inset-1 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500",
            hasSearched ? "bg-white/10" : "bg-gradient-to-r from-purple-600 to-cyan-500"
          )}
        ></div>
        <div className="relative flex items-center w-full h-16 rounded-full glass-strong px-6 overflow-hidden">
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-[var(--color-sphero-accent)] animate-spin mr-3" />
          ) : (
            <Search className="w-6 h-6 text-[var(--color-sphero-text-secondary)] group-hover:text-[var(--color-sphero-accent-light)] transition-colors mr-3" />
          )}

          <div className="relative flex-1 h-full flex items-center">
            {!localQuery && !hasSearched && (
              <div className="absolute inset-0 flex items-center pointer-events-none overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={placeholderIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[var(--color-sphero-text-muted)] text-lg truncate"
                  >
                    {SEARCH_PLACEHOLDERS[placeholderIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            )}
            
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder={hasSearched ? "Search again..." : ""}
              className="w-full bg-transparent border-none outline-none text-lg text-white placeholder-[var(--color-sphero-text-muted)]"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 ml-3">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[var(--color-sphero-text-muted)] bg-white/5 rounded border border-white/10">
              <span className="text-[10px]">⌘</span>K
            </kbd>
            <button
              type="submit"
              disabled={!localQuery.trim() || isLoading}
              className="px-6 py-2 rounded-full bg-[var(--color-sphero-text)] text-[var(--color-sphero-bg)] font-semibold text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
