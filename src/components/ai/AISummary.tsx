"use client";

import { useSearchStore } from "@/stores/searchStore";
import { useUIStore } from "@/stores/uiStore";
import { Sparkles, ChevronUp, ChevronDown, MessageCircleWarning, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendHeatmap } from "./TrendHeatmap";
import { cn } from "@/lib/utils";

export function AISummary() {
  const { aiSummary, hasSearched, isLoading } = useSearchStore();
  const { isAISummaryExpanded, toggleAISummary } = useUIStore();

  if (!hasSearched || (!aiSummary && !isLoading)) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="glass rounded-2xl overflow-hidden border border-white/10 glow-accent-strong transition-all duration-500">
        {/* Header */}
        <button
          onClick={toggleAISummary}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[var(--color-sphero-accent)]/10 to-[var(--color-sphero-cyan)]/10 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-sphero-accent)]/20 text-[var(--color-sphero-accent-light)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">AI Insights</h2>
          </div>
          <div className="text-[var(--color-sphero-text-muted)]">
            {isAISummaryExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {/* Content */}
        <AnimatePresence initial={false}>
          {isAISummaryExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 border-t border-white/5">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-white/5 rounded skeleton-shimmer w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded skeleton-shimmer w-full"></div>
                    <div className="h-4 bg-white/5 rounded skeleton-shimmer w-5/6"></div>
                  </div>
                ) : aiSummary ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Summary */}
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--color-sphero-accent-light)] mb-2 uppercase tracking-wider">
                          Overall Consensus
                        </h3>
                        <p className="text-[var(--color-sphero-text)] leading-relaxed text-sm md:text-base">
                          {aiSummary.overallSummary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[var(--color-sphero-cyan)]" /> Key Narratives
                          </h3>
                          <ul className="space-y-2">
                            {aiSummary.trendingNarratives.slice(0, 3).map((item, i) => (
                              <li key={i} className="text-sm text-[var(--color-sphero-text-secondary)] flex items-start gap-2">
                                <span className="text-[var(--color-sphero-cyan)] mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                            <MessageCircleWarning className="w-4 h-4 text-orange-400" /> Controversial Takes
                          </h3>
                          <ul className="space-y-2">
                            {aiSummary.controversialTakes.slice(0, 2).map((item, i) => (
                              <li key={i} className="text-sm text-[var(--color-sphero-text-secondary)] flex items-start gap-2">
                                <span className="text-orange-400 mt-0.5">•</span>
                                <span className="italic">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar metrics */}
                    <div className="space-y-6 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6">
                      <div>
                        <h3 className="text-sm font-semibold text-white/70 mb-3">Sentiment Breakdown</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-sphero-text-secondary)]">Positive</span>
                            <span className="text-[var(--color-sphero-positive)] font-medium">{aiSummary.sentimentBreakdown.positive}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--color-sphero-positive)]" style={{ width: `${aiSummary.sentimentBreakdown.positive}%` }} />
                          </div>
                          
                          <div className="flex items-center justify-between text-sm mt-3">
                            <span className="text-[var(--color-sphero-text-secondary)]">Neutral</span>
                            <span className="text-[var(--color-sphero-neutral)] font-medium">{aiSummary.sentimentBreakdown.neutral}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--color-sphero-neutral)]" style={{ width: `${aiSummary.sentimentBreakdown.neutral}%` }} />
                          </div>

                          <div className="flex items-center justify-between text-sm mt-3">
                            <span className="text-[var(--color-sphero-text-secondary)]">Negative</span>
                            <span className="text-[var(--color-sphero-negative)] font-medium">{aiSummary.sentimentBreakdown.negative}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--color-sphero-negative)]" style={{ width: `${aiSummary.sentimentBreakdown.negative}%` }} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-white/70 mb-1">Platform Activity</h3>
                        <TrendHeatmap />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
