"use client";

import { UnifiedPost } from "@/lib/types";
import { cn, timeAgo, formatNumber, getDeepLink, getPlatformColor } from "@/lib/utils";
import { Heart, MessageSquare, ExternalLink, Image as ImageIcon, Link as LinkIcon, BarChart2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { SentimentBadge } from "@/components/ai/SentimentBadge";

interface ResultCardProps {
  post: UnifiedPost;
  index: number;
  variant?: "large" | "medium" | "small";
}

export function ResultCard({ post, index, variant = "medium" }: ResultCardProps) {
  const platformColor = getPlatformColor(post.platform);
  const targetUrl = getDeepLink(post.platform, post.url);
  
  // Calculate engagement score for trend indicator
  const totalEngagement = post.engagement.likes + post.engagement.comments + post.engagement.shares;
  const trendDirection = post.engagement.likes > totalEngagement * 0.6 ? "positive" : 
                         post.engagement.comments > totalEngagement * 0.4 ? "controversial" : "neutral";

  const baseHeight = {
    large: "min-h-[420px]",
    medium: "min-h-[360px]",
    small: "min-h-[300px]"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
      onClick={() => window.open(targetUrl, '_blank', 'noopener,noreferrer')}
      className={cn(
        "glass glass-hover p-5 flex flex-col gap-4 relative group transition-all duration-300",
        baseHeight[variant],
        "rounded-3xl hover:shadow-2xl cursor-pointer"
      )}
    >
      {/* Gradient Background */}
      <div 
        className="absolute -inset-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ 
          background: `linear-gradient(135deg, transparent, ${platformColor}15)`,
          zIndex: -1
        }}
      />

      {/* Mini Insights - Sentiment Dots */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        {post.sentiment && (
          <div className={cn(
            "w-3 h-3 rounded-full",
            post.sentiment === "positive" && "bg-[#22c55e] animate-pulse",
            post.sentiment === "negative" && "bg-[#ef4444]",
            post.sentiment === "neutral" && "bg-[#94a3b8]",
            post.sentiment === "mixed" && "bg-gradient-to-r from-[#22c55e] to-[#ef4444]"
          )} />
        )}
        {trendDirection === "positive" && (
          <TrendingUp className="w-4 h-4 text-[#22c55e]" />
        )}
      </div>

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-sphero-border)]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-sphero-accent)] to-[var(--color-sphero-cyan)] border-2 border-[var(--color-sphero-border)] flex items-center justify-center font-bold text-lg text-[var(--color-sphero-bg)]">
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-[var(--color-sphero-text)] flex items-center gap-2">
              {post.authorName}
              <span className="text-xs font-normal text-[var(--color-sphero-text-muted)] flex items-center gap-1 px-2 py-1 rounded-full bg-red-100">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platformColor }} />
                {post.platform}
              </span>
            </div>
            <div className="text-xs text-[var(--color-sphero-text-muted)]">
              {post.authorHandle} • {timeAgo(post.timestamp)}
            </div>
          </div>
        </div>
        
        {post.sentiment && <SentimentBadge sentiment={post.sentiment} />}
      </div>

      <div className="text-[var(--color-sphero-text)] text-sm leading-relaxed whitespace-pre-wrap break-words flex-1 overflow-hidden">
        {post.content.length > 250 ? `${post.content.substring(0, 250)}...` : post.content}
      </div>

      {post.mediaType === "video" && post.mediaUrl ? (
        <div
          className="mt-auto relative rounded-2xl overflow-hidden border border-[var(--color-sphero-border)] aspect-video flex items-center justify-center group/media cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img 
            src={post.mediaUrl} 
            alt={post.content}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover/media:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[var(--color-sphero-accent)] flex items-center justify-center">
              <div className="w-0 h-0 border-l-6 border-l-transparent border-r-0 border-y-4 border-y-transparent border-l-white ml-1" />
            </div>
          </div>
        </div>
      ) : post.mediaType && (
        <div className="mt-auto relative rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-sphero-accent)]/10 to-[var(--color-sphero-cyan)]/10 border border-[var(--color-sphero-border)] aspect-video flex items-center justify-center group/media cursor-pointer">
          {post.mediaType === "image" ? <ImageIcon className="w-8 h-8 text-[var(--color-sphero-accent)] opacity-60 group-hover/media:opacity-100 transition-opacity" /> :
           <LinkIcon className="w-8 h-8 text-[var(--color-sphero-accent)] opacity-60 group-hover/media:opacity-100 transition-opacity" />}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-sphero-accent)]/5 to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Engagement Mini Insights */}
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--color-sphero-border)]">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-100">
            <Heart className="w-3.5 h-3.5 text-[var(--color-sphero-accent)]" />
            <span className="text-[var(--color-sphero-text)] font-medium">{formatNumber(post.engagement.likes)}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-100">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--color-sphero-cyan)]" />
            <span className="text-[var(--color-sphero-text)] font-medium">{formatNumber(post.engagement.comments)}</span>
          </div>
          {post.engagement.views !== undefined && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-200">
              <BarChart2 className="w-3.5 h-3.5 text-[var(--color-sphero-text-muted)]" />
              <span className="text-[var(--color-sphero-text)] font-medium">{formatNumber(post.engagement.views)}</span>
            </div>
          )}
        </div>
        
        <div 
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-sphero-accent)] hover:text-[var(--color-sphero-accent-light)] transition-colors hover:translate-x-1 duration-200 cursor-pointer"
        >
          Open <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}
