"use client";

import { Sentiment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Smile, Frown, Meh, HelpCircle } from "lucide-react";

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const config = {
    positive: {
      color: "text-[var(--color-sphero-positive)]",
      bg: "bg-[var(--color-sphero-positive)]/10",
      border: "border-[var(--color-sphero-positive)]/20",
      icon: Smile,
      label: "Positive",
    },
    negative: {
      color: "text-[var(--color-sphero-negative)]",
      bg: "bg-[var(--color-sphero-negative)]/10",
      border: "border-[var(--color-sphero-negative)]/20",
      icon: Frown,
      label: "Negative",
    },
    neutral: {
      color: "text-[var(--color-sphero-neutral)]",
      bg: "bg-[var(--color-sphero-neutral)]/10",
      border: "border-[var(--color-sphero-neutral)]/20",
      icon: Meh,
      label: "Neutral",
    },
    mixed: {
      color: "text-[var(--color-sphero-mixed)]",
      bg: "bg-[var(--color-sphero-mixed)]/10",
      border: "border-[var(--color-sphero-mixed)]/20",
      icon: HelpCircle,
      label: "Mixed",
    },
  };

  const current = config[sentiment];
  const Icon = current.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
        current.bg,
        current.border,
        current.color
      )}
      title={`AI Sentiment: ${current.label}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{current.label}</span>
    </div>
  );
}
