"use client";

import { useRef, useEffect } from "react";
import { useSearchStore } from "@/stores/searchStore";
import { PLATFORM_TABS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Globe, Twitter, MessageCircle, Youtube, Linkedin, AtSign, Instagram, Music, Facebook, BookOpen, Terminal } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  globe: <Globe className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
  "message-circle": <MessageCircle className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  "at-sign": <AtSign className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  music: <Music className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  "book-open": <BookOpen className="w-4 h-4" />,
  terminal: <Terminal className="w-4 h-4" />,
};

export function PlatformTabs() {
  const { activePlatform, setActivePlatform, results, hasSearched } = useSearchStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!hasSearched) return null;

  // Calculate counts
  const tabsWithCounts = PLATFORM_TABS.map((tab) => {
    if (tab.id === "all") return { ...tab, count: results.length };
    return { ...tab, count: results.filter((r) => r.platform === tab.id).length };
  });

  return (
    <div className="w-full border-b border-[var(--color-sphero-border)] mb-6 sticky top-16 z-10 bg-[var(--color-sphero-bg)]/80 backdrop-blur-md">
      <div 
        ref={scrollRef}
        className="flex items-center overflow-x-auto no-scrollbar py-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex space-x-2">
          {tabsWithCounts.map((tab) => {
            const isActive = activePlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => tab.available && setActivePlatform(tab.id)}
                disabled={!tab.available}
                className={cn(
                  "relative flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "text-white"
                    : tab.available
                    ? "text-[var(--color-sphero-text-secondary)] hover:text-white hover:bg-white/5"
                    : "text-[var(--color-sphero-text-muted)] cursor-not-allowed opacity-50"
                )}
                title={!tab.available ? "Coming Soon" : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-2">
                  {iconMap[tab.icon]}
                  <span>{tab.label}</span>
                  {tab.available && tab.count > 0 && (
                    <span className={cn(
                      "ml-1.5 py-0.5 px-2 rounded-full text-xs",
                      isActive ? "bg-[var(--color-sphero-accent)]/20 text-[var(--color-sphero-accent-light)]" : "bg-white/10 text-white/70"
                    )}>
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
