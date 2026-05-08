export type Platform =
  | "x"
  | "reddit"
  | "youtube"
  | "linkedin"
  | "threads"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "medium"
  | "hackernews";

export type Sentiment = "positive" | "negative" | "neutral" | "mixed";

export type FilterType =
  | "recent"
  | "viral"
  | "informative"
  | "controversial"
  | "videos"
  | "news"
  | "memes"
  | "tutorials"
  | "professional";

export interface Engagement {
  likes: number;
  comments: number;
  shares: number;
  views?: number;
}

export interface UnifiedPost {
  id: string;
  platform: Platform;
  authorName: string;
  authorAvatar: string | null;
  authorHandle: string;
  content: string;
  url: string;
  deepLink?: string;
  timestamp: string;
  engagement: Engagement;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "link";
  sentiment?: Sentiment;
  relevanceScore: number;
}

export interface AISummaryData {
  overallSummary: string;
  keyOpinions: string[];
  trendingNarratives: string[];
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  controversialTakes: string[];
}

export interface PlatformHeat {
  platform: Platform;
  count: number;
  intensity: number; // 0-5
}

export interface SearchState {
  query: string;
  results: UnifiedPost[];
  aiSummary: AISummaryData | null;
  platformHeat: PlatformHeat[];
  activePlatform: Platform | "all";
  activeFilter: FilterType | null;
  isLoading: boolean;
  isLiveMode: boolean;
  searchHistory: string[];
}

export interface PlatformTab {
  id: Platform | "all";
  label: string;
  icon: string;
  count: number;
  available: boolean;
}
