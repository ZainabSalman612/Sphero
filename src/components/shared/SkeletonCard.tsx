import { cn } from "@/lib/utils";

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full skeleton-shimmer" />
          <div className="space-y-2">
            <div className="w-24 h-4 rounded skeleton-shimmer" />
            <div className="w-32 h-3 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="w-16 h-6 rounded-full skeleton-shimmer" />
      </div>

      <div className="space-y-2 mt-2">
        <div className="w-full h-4 rounded skeleton-shimmer" />
        <div className="w-11/12 h-4 rounded skeleton-shimmer" />
        <div className="w-4/5 h-4 rounded skeleton-shimmer" />
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--color-sphero-border)]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-4 rounded skeleton-shimmer" />
          <div className="w-8 h-4 rounded skeleton-shimmer" />
          <div className="w-8 h-4 rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
