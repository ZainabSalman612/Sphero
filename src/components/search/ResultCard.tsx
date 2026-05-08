"use client";

import { UnifiedPost } from "@/lib/types";
import { cn, timeAgo, formatNumber, getDeepLink, getPlatformColor } from "@/lib/utils";
import { Heart, MessageSquare, Share2, ExternalLink, Image as ImageIcon, Video, Link as LinkIcon, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { SentimentBadge } from "@/components/ai/SentimentBadge";

interface ResultCardProps {
  post: UnifiedPost;
  index: number;
}

export function ResultCard({ post, index }: ResultCardProps) {
  const platformColor = getPlatformColor(post.platform);
  const targetUrl = getDeepLink(post.platform, post.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
      className="glass glass-hover rounded-2xl p-5 flex flex-col gap-4 relative group"
    >
      {/* Platform subtle glow */}
      <div 
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ 
          background: `linear-gradient(to bottom right, transparent, ${platformColor}20)`,
          zIndex: -1
        }}
      />

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-white/80">
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-[var(--color-sphero-text)] flex items-center gap-2">
              {post.authorName}
              <span className="text-xs font-normal text-[var(--color-sphero-text-muted)] flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platformColor }} />
                {post.platform}
              </span>
            </div>
            <div className="text-sm text-[var(--color-sphero-text-muted)]">
              {post.authorHandle} • {timeAgo(post.timestamp)}
            </div>
          </div>
        </div>
        
        {post.sentiment && <SentimentBadge sentiment={post.sentiment} />}
      </div>

      <div className="text-[var(--color-sphero-text)] text-sm leading-relaxed whitespace-pre-wrap break-words">
        {post.content}
      </div>

      {post.mediaType && (
        <div className="mt-2 relative rounded-xl overflow-hidden bg-black/40 border border-white/5 aspect-video flex items-center justify-center group/media cursor-pointer">
          {post.mediaType === "video" ? <Video className="w-8 h-8 text-white/50 group-hover/media:text-white/80 transition-colors" /> :
           post.mediaType === "image" ? <ImageIcon className="w-8 h-8 text-white/50 group-hover/media:text-white/80 transition-colors" /> :
           <LinkIcon className="w-8 h-8 text-white/50 group-hover/media:text-white/80 transition-colors" />}
          <div className="absolute inset-0 bg-black/20 group-hover/media:bg-transparent transition-colors" />
        </div>
      )}

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--color-sphero-border)]">
        <div className="flex items-center gap-4 text-[var(--color-sphero-text-secondary)] text-sm">
          <div className="flex items-center gap-1.5 hover:text-pink-500 transition-colors cursor-default">
            <Heart className="w-4 h-4" />
            <span>{formatNumber(post.engagement.likes)}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-default">
            <MessageSquare className="w-4 h-4" />
            <span>{formatNumber(post.engagement.comments)}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-green-400 transition-colors cursor-default">
            <Share2 className="w-4 h-4" />
            <span>{formatNumber(post.engagement.shares)}</span>
          </div>
          {post.engagement.views !== undefined && (
            <div className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
              <BarChart2 className="w-4 h-4" />
              <span>{formatNumber(post.engagement.views)}</span>
            </div>
          )}
        </div>
        
        <a 
          href={targetUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-sphero-text)] hover:text-[var(--color-sphero-accent-light)] transition-colors"
        >
          Open <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
