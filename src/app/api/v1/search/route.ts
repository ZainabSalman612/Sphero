import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateMockPosts } from "@/lib/mock-data";
import type { AISummaryData } from "@/lib/types";

// Global instantiation removed, will initialize inside function


// ── YouTube Data API types ─────────────────────────────────────────────
interface YTSearchItem {
  id: { videoId?: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
  };
}

interface YTStatsItem {
  id: string;
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

// ── Fetch real YouTube videos ──────────────────────────────────────────
async function fetchYouTubePosts(query: string, pageToken?: string) {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;
  if (!apiKey) {
    console.warn("YOUTUBE_DATA_API_KEY not set — skipping YouTube fetch");
    return { posts: [], nextPageToken: null };
  }

  try {
    // Step 1: Search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=50&q=${encodeURIComponent(query)}&relevanceLanguage=en${pageToken ? `&pageToken=${pageToken}` : ""}&key=${apiKey}`;
    const searchRes = await fetch(
      searchUrl,
      { next: { revalidate: 120 } }
    );

    if (!searchRes.ok) {
      console.error("YouTube search error:", searchRes.status, await searchRes.text());
      return { posts: [], nextPageToken: null };
    }

    const searchData = await searchRes.json();
    const items: YTSearchItem[] = searchData.items || [];
    const nextPageToken = searchData.nextPageToken || null;
    const videoIds = items.map((item) => item.id.videoId).filter(Boolean);

    if (videoIds.length === 0) return { posts: [], nextPageToken: null };

    // Step 2: Get video statistics (views, likes, comments)
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(",")}&key=${apiKey}`,
      { next: { revalidate: 120 } }
    );

    let statsMap: Record<string, YTStatsItem["statistics"]> = {};
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      for (const stat of (statsData.items || []) as YTStatsItem[]) {
        statsMap[stat.id] = stat.statistics;
      }
    }

    // Step 3: Map to UnifiedPost format
    const posts = items
      .filter((item) => item.id.videoId)
      .map((item) => {
        const videoId = item.id.videoId!;
        const stats = statsMap[videoId] || {};
        const views = parseInt(stats.viewCount || "0", 10);
        const likes = parseInt(stats.likeCount || "0", 10);
        const ytComments = parseInt(stats.commentCount || "0", 10);
        const thumbnail = item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url;

        return {
          id: `yt-${videoId}`,
          platform: "youtube" as const,
          authorName: item.snippet.channelTitle,
          authorAvatar: null,
          authorHandle: `@${item.snippet.channelTitle.toLowerCase().replace(/\s+/g, "")}`,
          content: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          deepLink: `https://www.youtube.com/watch?v=${videoId}`,
          timestamp: item.snippet.publishedAt,
          engagement: {
            likes,
            comments: ytComments,
            shares: 0,
            views,
          },
          mediaUrl: thumbnail,
          mediaType: "video" as const,
          sentiment: "neutral" as const,
          relevanceScore: Math.min(1.0, Math.max(0.5, views / 500000)),
        };
      });

    return { posts, nextPageToken };
  } catch (err) {
    console.error("YouTube fetch error:", err);
    return { posts: [], nextPageToken: null };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Build prompt for Gemini ────────────────────────────────────────────
function buildGeminiPrompt(query: string, posts: import("@/lib/types").UnifiedPost[]): string {
  const postBlock = posts
    .slice(0, 15)
    .map((p, i) => `${i + 1}. "${p.content}" by ${p.authorName} (${p.engagement.likes ?? 0} likes, ${p.engagement.comments ?? 0} comments)`)
    .join("\n");

  return `You are an expert social-media analyst. A user searched for "${query}".

Below are REAL posts/videos about this topic.

=== TOP POSTS ===
${postBlock || "No posts found."}

Analyze the above content and return a JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):

{
  "overallSummary": "A 2-4 sentence paragraph summarizing the overall discussion, tone, and consensus on this topic across the posts.",
  "keyOpinions": ["opinion 1", "opinion 2", "opinion 3", "opinion 4", "opinion 5"],
  "trendingNarratives": ["narrative 1", "narrative 2", "narrative 3", "narrative 4"],
  "sentimentBreakdown": {
    "positive": <number 0-100>,
    "negative": <number 0-100>,
    "neutral": <number 0-100>
  },
  "controversialTakes": ["take 1", "take 2", "take 3"]
}

Rules:
- The three sentiment numbers MUST add up to 100.
- Base your analysis ONLY on the real posts above.
- keyOpinions: 5 distinct viewpoints expressed in the discussion.
- trendingNarratives: 4 emerging themes or recurring narratives.
- controversialTakes: 2-3 divisive or provocative statements from the discussion.
- Keep each string concise (1-2 sentences max).
- Return ONLY the JSON object, nothing else.`;
}

// ── Call Gemini with retry logic ────────────────────────────────────────
async function callGeminiWithRetry(prompt: string, maxRetries = 2): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      const is429 = error?.message?.includes("429") || error?.status === 429;

      if (is429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s
        console.warn(`Gemini 429 — retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  return null;
}

// ── Smart local fallback when Gemini is unavailable ────────────────────
function buildLocalFallbackSummary(
  query: string,
  posts: import("@/lib/types").UnifiedPost[]
): AISummaryData {
  const topPosts = posts.slice(0, 10);

  // Build summary from actual content
  const contentList = topPosts.map((p) => p.content).filter(Boolean);
  const overallSummary = contentList.length > 0
    ? `The community is actively discussing "${query}" with ${posts.length} recent posts. Top discussions include: ${contentList.slice(0, 3).map(t => `"${t}"`).join(", ")}. The community shows strong engagement with diverse perspectives on this topic.`
    : `The search for "${query}" returned limited results. This topic may be emerging or niche.`;

  const keyOpinions = contentList.length > 0
    ? contentList.slice(0, 5).map((t) => t.slice(0, 150) + (t.length > 150 ? "…" : ""))
    : ["Community discussion is ongoing — check individual posts for detailed viewpoints"];

  // Narratives from content
  const trendingNarratives = contentList.length > 0
    ? contentList.slice(0, 4)
    : ["No strong narratives detected yet for this search"];

  // Simple engagement-based sentiment approximation
  const totalLikes = topPosts.reduce((sum, p) => sum + (p.engagement.likes || 0), 0);
  const totalComments = topPosts.reduce((sum, p) => sum + (p.engagement.comments || 0), 0);
  const engagementRatio = totalComments > 0 ? totalLikes / totalComments : 1;

  // High likes-to-comments ratio = positive, low = controversial/negative
  const positive = Math.round(Math.min(65, Math.max(20, engagementRatio * 15)));
  const negative = Math.round(Math.min(40, Math.max(10, 100 - engagementRatio * 20)));
  const neutral = 100 - positive - negative;

  // Controversial = highest comment counts relative to likes
  const controversial = [...topPosts]
    .sort((a, b) => ((b.engagement.comments || 0) / Math.max(b.engagement.likes || 1, 1)) - ((a.engagement.comments || 0) / Math.max(a.engagement.likes || 1, 1)))
    .slice(0, 3)
    .map((p) => p.content || "")
    .filter(Boolean);

  return {
    overallSummary,
    keyOpinions,
    trendingNarratives,
    sentimentBreakdown: { positive, negative, neutral },
    controversialTakes: controversial.length > 0
      ? controversial
      : ["No strongly controversial takes detected in current results"],
  };
}

// ── Call Gemini for real AI summarization ───────────────────────────────
async function generateAISummary(
  query: string,
  posts: import("@/lib/types").UnifiedPost[]
): Promise<AISummaryData | null> {
  // If there's no data to analyze, skip entirely
  if (posts.length === 0) {
    return null;
  }

  // If no API key, return explicit error
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.warn("GOOGLE_GEMINI_API_KEY not set — cannot generate AI summary");
    return {
      overallSummary: "⚠️ AI Summary generation failed: No Gemini API Key was found. Please add GOOGLE_GEMINI_API_KEY to your .env.local file.",
      keyOpinions: ["API Key Missing"],
      trendingNarratives: ["API Key Missing"],
      sentimentBreakdown: { positive: 33, negative: 33, neutral: 34 },
      controversialTakes: ["API Key Missing"],
    };
  }

  try {
    const prompt = buildGeminiPrompt(query, posts);
    const text = await callGeminiWithRetry(prompt);

    if (!text) {
      console.warn("Gemini returned no text — using local fallback");
      return {
        overallSummary: "⚠️ AI Summary generation failed: Gemini API returned an empty response.",
        keyOpinions: ["Empty Response"],
        trendingNarratives: ["Empty Response"],
        sentimentBreakdown: { positive: 33, negative: 33, neutral: 34 },
        controversialTakes: ["Empty Response"],
      };
    }

    // Strip potential markdown code fences the model might add
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed: AISummaryData = JSON.parse(cleaned);

    // Validate and clamp sentiment to ensure it sums to 100
    const total =
      (parsed.sentimentBreakdown?.positive ?? 0) +
      (parsed.sentimentBreakdown?.negative ?? 0) +
      (parsed.sentimentBreakdown?.neutral ?? 0);

    if (total !== 100 && total > 0) {
      const factor = 100 / total;
      parsed.sentimentBreakdown.positive = Math.round(parsed.sentimentBreakdown.positive * factor);
      parsed.sentimentBreakdown.negative = Math.round(parsed.sentimentBreakdown.negative * factor);
      parsed.sentimentBreakdown.neutral =
        100 - parsed.sentimentBreakdown.positive - parsed.sentimentBreakdown.negative;
    }

    return parsed;
  } catch (err: any) {
    console.error("Gemini AI summary error:", err);
    const is429 = err?.message?.includes("429") || err?.status === 429 || err?.statusText === "Too Many Requests";
    
    return {
      overallSummary: is429 
        ? "⚠️ AI Summary generation failed: Gemini API rate limit exceeded (429 Too Many Requests). Please check your Google AI Studio quota or billing details."
        : "⚠️ AI Summary generation failed: An unexpected error occurred while communicating with the Gemini API.",
      keyOpinions: ["API Error - Could not generate insights"],
      trendingNarratives: ["API Error - Could not generate narratives"],
      sentimentBreakdown: { positive: 33, negative: 33, neutral: 34 },
      controversialTakes: ["API Error - Could not generate takes"],
    };
  }
}

// ── GET handler ────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const pageToken = searchParams.get("pageToken") || undefined;

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch real data from live APIs
    const { posts: ytPosts, nextPageToken } = await fetchYouTubePosts(query, pageToken);

    // 2. Combine all real sources only (no mock data) & sort by relevance
    const combinedResults = [...ytPosts].sort(
      (a, b) => b.relevanceScore - a.relevanceScore
    );

    // 4. Generate REAL AI summary via Gemini (only on first page search)
    const aiSummary = pageToken ? null : await generateAISummary(query, combinedResults);

    // 5. Build platform heat from actual data only
    const platformHeat = [];
    
    if (ytPosts.length > 0) {
      platformHeat.push({
        platform: "youtube" as const,
        count: ytPosts.length,
        intensity: Math.min(5, Math.ceil(ytPosts.length / 2)),
      });
    }

    return NextResponse.json({
      query,
      results: combinedResults,
      aiSummary,
      platformHeat,
      nextPageToken,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
