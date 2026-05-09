"use client";

import Link from "next/link";
import { useSearchStore } from "@/stores/searchStore";
import { useAuthStore } from "@/stores/authStore";
import { Radio, Menu, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const { isLiveMode, toggleLiveMode } = useSearchStore();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-sphero-border)] bg-[var(--color-sphero-bg)]/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 -ml-2 text-[var(--color-sphero-text-secondary)] hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-sphero-accent)] to-[var(--color-sphero-cyan)] flex items-center justify-center glow-cyan group-hover:glow-accent-strong transition-all duration-300">
              <div className="absolute inset-0.5 bg-[var(--color-sphero-bg)] rounded-full z-0" />
              <div className="w-3 h-3 rounded-full bg-[var(--color-sphero-text)] z-10" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">Sphero</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLiveMode}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-300",
              isLiveMode 
                ? "bg-red-500/10 border-red-500/30 text-red-400" 
                : "glass border-[var(--color-sphero-border)] text-[var(--color-sphero-text-secondary)] hover:text-white"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", isLiveMode ? "bg-red-500 animate-pulse" : "bg-white/30")} />
            LIVE
          </button>

          {isAuthenticated ? (
            <>
              <button className="p-2 text-[var(--color-sphero-text-secondary)] hover:text-white transition-colors rounded-full hover:bg-white/5 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-sphero-accent)] rounded-full border border-[var(--color-sphero-bg)]" />
              </button>

              <Link href="/dashboard" className="p-1 rounded-full bg-gradient-to-tr from-[var(--color-sphero-accent)] to-[var(--color-sphero-cyan)] glow-cyan hover:glow-accent-strong transition-all">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-[var(--color-sphero-bg)]" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-sphero-bg)] flex items-center justify-center text-white/80 font-bold text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            </>
          ) : (
            <Link href="/login" className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
