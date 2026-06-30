"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useSearchStore } from "@/stores/searchStore";
import { Search, Bookmark, Activity, Clock, LogOut } from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { searchHistory, performSearch } = useSearchStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const handleSearchReplay = (query: string) => {
    performSearch(query);
    router.push("/");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}</h1>
          <p className="text-[var(--color-sphero-text-secondary)]">Manage your saved searches, bookmarks, and account.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - History & Searches */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Recent Searches */}
          <section className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6 text-white font-semibold">
              <Clock className="w-5 h-5 text-[var(--color-sphero-accent-light)]" />
              <h3>Recent Searches</h3>
            </div>
            
            {searchHistory.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {searchHistory.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchReplay(query)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm"
                  >
                    <Search className="w-3.5 h-3.5 text-[var(--color-sphero-text-muted)]" />
                    {query}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--color-sphero-text-muted)]">
                No recent searches. Try searching for something!
              </div>
            )}
          </section>

          {/* Saved Bookmarks (Mock UI) */}
          <section className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6 text-white font-semibold">
              <Bookmark className="w-5 h-5 text-[var(--color-sphero-cyan)]" />
              <h3>Saved Bookmarks</h3>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex justify-between items-start cursor-pointer group">
                  <div>
                    <div className="text-sm text-[var(--color-sphero-text-muted)] mb-1">
                      Saved {timeAgo(new Date(Date.now() - i * 86400000))}
                    </div>
                    <p className="text-white group-hover:text-[var(--color-sphero-cyan)] transition-colors line-clamp-2">
                      {i === 1 ? "The conversation around AI is hitting a tipping point. Every major tech CEO..." : 
                       i === 2 ? "Just had a fascinating discussion about frontend frameworks at work..." :
                       "I built an open-source tool to analyze trends across academic papers..."}
                    </p>
                  </div>
                  <button className="text-[var(--color-sphero-text-muted)] hover:text-red-400 p-2">
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button className="text-sm text-[var(--color-sphero-text-secondary)] hover:text-white transition-colors">
                View all bookmarks
              </button>
            </div>
          </section>

        </div>

        {/* Right Column - Stats */}
        <div className="space-y-8">
          <section className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6 text-white font-semibold">
              <Activity className="w-5 h-5 text-green-400" />
              <h3>Your Activity</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-black/30 rounded-xl p-4 flex justify-between items-center border border-white/5">
                <span className="text-[var(--color-sphero-text-secondary)] text-sm">Total Searches</span>
                <span className="text-xl font-bold text-white">128</span>
              </div>
              <div className="bg-black/30 rounded-xl p-4 flex justify-between items-center border border-white/5">
                <span className="text-[var(--color-sphero-text-secondary)] text-sm">Posts Bookmarked</span>
                <span className="text-xl font-bold text-white">42</span>
              </div>
              <div className="bg-black/30 rounded-xl p-4 flex justify-between items-center border border-white/5">
                <span className="text-[var(--color-sphero-text-secondary)] text-sm">Alerts Active</span>
                <span className="text-xl font-bold text-[var(--color-sphero-accent-light)]">3</span>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
