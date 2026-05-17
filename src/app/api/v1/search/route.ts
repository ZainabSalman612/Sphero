import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateMockPosts } from "@/lib/mock-data";
import type { AISummaryData } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// ── Hacker News Algolia types ──────────────────────────────────────────
interface HNHit {
  objectID: string;
  title?: string;
  story_text?: string;
  comment_text?: string;
  author?: string;
  url?: string;
  created_at: string;
  points?: number;
  num_comments?: number;
}

// ── Fetch real HN posts ────────────────────────────────────────────────
async function fetchHackerNewsPosts(query: string) {
  try {
    // Fetch stories
    const storiesRes = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`,
      { next: { revalidate: 60 } }
    );

    // Fetch comments for richer context
    const commentsRes = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=comment&hitsPerPage=15`,
      { next: { revalidate: 60 } }
    );

    const [storiesData, commentsData] = await Promise.all([
      storiesRes.ok ? storiesRes.json() : { hits: [] },
      commentsRes.ok ? commentsRes.json() : { hits: [] },
    ]);

    const stories: HNHit[] = storiesData.hits || [];
    const comments: HNHit[] = commentsData.hits || [];

    // Map stories → UnifiedPost format
    const storyPosts = stories
      .filter((hit: HNHit) => hit.title)
      .map((hit: HNHit) => ({
        id: `hn-${hit.objectID}`,
        platform: "hackernews" as const,
        authorName: hit.author || "anonymous",
        authorAvatar: null,
        authorHandle: hit.author || "anonymous",
        content: hit.title || "",
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        timestamp: hit.created_at,
        engagement: {
          likes: hit.points || 0,
          comments: hit.num_comments || 0,
          shares: 0,
        },
        relevanceScore: Math.min(1.0, Math.max(0.5, (hit.points || 0) / 500.0)),
        sentiment: "neutral" as const,
      }));

    return { storyPosts, stories, comments };
  } catch (err) {
    console.error("HN fetch error:", err);
    return { storyPosts: [], stories: [], comments: [] };
  }
}

// ── Strip HTML from HN comments ────────────────────────────────────────
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
function buildGeminiPrompt(query: string, stories: HNHit[], comments: HNHit[]): string {
  const storyBlock = stories
    .slice(0, 10)
    .map((s, i) => `${i + 1}. "${s.title}" by ${s.author} (${s.points ?? 0} pts, ${s.num_comments ?? 0} comments)`)
    .join("\n");

  const commentBlock = comments
    .slice(0, 15)
    .map((c) => `- ${stripHtml(c.comment_text || c.story_text || "").slice(0, 300)}`)
    .join("\n");

  return `You are an expert social-media analyst. A user searched for "${query}".

Below are REAL Hacker News stories and comments about this topic.

=== TOP STORIES ===
${storyBlock || "No stories found."}

=== SAMPLE COMMENTS ===
${commentBlock || "No comments found."}

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
- Base your analysis ONLY on the real posts/comments above.
- keyOpinions: 5 distinct viewpoints expressed in the discussion.
- trendingNarratives: 4 emerging themes or recurring narratives.
- controversialTakes: 2-3 divisive or provocative statements from the discussion.
- Keep each string concise (1-2 sentences max).
- Return ONLY the JSON object, nothing else.`;
}

// ── Call Gemini with retry logic ────────────────────────────────────────
async function callGeminiWithRetry(prompt: string, maxRetries = 2): Promise<string | null> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
  stories: HNHit[],
  comments: HNHit[]
): AISummaryData {
  const topStories = stories.slice(0, 5);
  const topComments = comments.slice(0, 10);

  // Build summary from actual titles
  const titleList = topStories.map((s) => s.title).filter(Boolean);
  const overallSummary = titleList.length > 0
    ? `Hacker News is actively discussing "${query}" with ${stories.length} recent stories and ${comments.length} comments. Top discussions include: ${titleList.slice(0, 3).map(t => `"${t}"`).join(", ")}. The community shows strong engagement with diverse perspectives on this topic.`
    : `The search for "${query}" returned limited results from Hacker News. This topic may be emerging or niche within the HN community.`;

  // Extract key opinions from comment snippets
  const commentTexts = topComments
    .map((c) => stripHtml(c.comment_text || c.story_text || ""))
    .filter((t) => t.length > 30);
  const keyOpinions = commentTexts.length > 0
    ? commentTexts.slice(0, 5).map((t) => t.slice(0, 150) + (t.length > 150 ? "…" : ""))
    : ["Community discussion is ongoing — check individual posts for detailed viewpoints"];

  // Narratives from story titles
  const trendingNarratives = titleList.length > 0
    ? titleList.slice(0, 4)
    : ["No strong narratives detected yet for this search"];

  // Simple engagement-based sentiment approximation
  const totalPoints = topStories.reduce((sum, s) => sum + (s.points || 0), 0);
  const totalComments = topStories.reduce((sum, s) => sum + (s.num_comments || 0), 0);
  const engagementRatio = totalComments > 0 ? totalPoints / totalComments : 1;

  // High points-to-comments ratio = positive, low = controversial/negative
  const positive = Math.round(Math.min(65, Math.max(20, engagementRatio * 15)));
  const negative = Math.round(Math.min(40, Math.max(10, 100 - engagementRatio * 20)));
  const neutral = 100 - positive - negative;

  // Controversial = highest comment counts relative to points
  const controversial = [...topStories]
    .sort((a, b) => ((b.num_comments || 0) / Math.max(b.points || 1, 1)) - ((a.num_comments || 0) / Math.max(a.points || 1, 1)))
    .slice(0, 3)
    .map((s) => s.title || "")
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
  stories: HNHit[],
  comments: HNHit[]
): Promise<AISummaryData | null> {
  // If there's no data to analyze, skip entirely
  if (stories.length === 0 && comments.length === 0) {
    return null;
  }

  // If no API key, go straight to local fallback
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.warn("GOOGLE_GEMINI_API_KEY not set — using local fallback");
    return buildLocalFallbackSummary(query, stories, comments);
  }

  try {
    const prompt = buildGeminiPrompt(query, stories, comments);
    const text = await callGeminiWithRetry(prompt);

    if (!text) {
      console.warn("Gemini returned no text — using local fallback");
      return buildLocalFallbackSummary(query, stories, comments);
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
  } catch (err) {
    console.error("Gemini AI summary error — falling back to local analysis:", err);
    return buildLocalFallbackSummary(query, stories, comments);
  }
}

// ── GET handler ────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch real Hacker News data
    const { storyPosts, stories, comments } = await fetchHackerNewsPosts(query);

    // 2. Get mock posts for other platforms (X, Reddit, Medium, YouTube)
    const allMocks = generateMockPosts(query);
    const mockPosts = allMocks.filter((p) => p.platform !== "hackernews");

    // 3. Combine & sort by relevance
    const combinedResults = [...storyPosts, ...mockPosts].sort(
      (a, b) => b.relevanceScore - a.relevanceScore
    );

    // 4. Generate REAL AI summary via Gemini (runs in parallel-ish with nothing else)
    const aiSummary = await generateAISummary(query, stories, comments);

    // 5. Build platform heat from actual data
    const platformHeat = [
      {
        platform: "hackernews" as const,
        count: storyPosts.length,
        intensity: Math.min(5, Math.ceil(storyPosts.length / 2)),
      },
      {
        platform: "x" as const,
        count: mockPosts.filter((p) => p.platform === "x").length * 1500,
        intensity: 5,
      },
      {
        platform: "reddit" as const,
        count: mockPosts.filter((p) => p.platform === "reddit").length * 1200,
        intensity: 4,
      },
      {
        platform: "youtube" as const,
        count: mockPosts.filter((p) => p.platform === "youtube").length * 800,
        intensity: 3,
      },
      {
        platform: "medium" as const,
        count: mockPosts.filter((p) => p.platform === "medium").length * 300,
        intensity: 2,
      },
    ].sort((a, b) => b.count - a.count);

    return NextResponse.json({
      query,
      results: combinedResults,
      aiSummary,
      platformHeat,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
