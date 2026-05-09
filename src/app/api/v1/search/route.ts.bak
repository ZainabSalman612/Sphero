import { NextResponse } from "next/server";
import { generateMockPosts, generateMockAISummary, generateMockPlatformHeat } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    // 1. Fetch Hacker News (Live data)
    let hnPosts = [];
    try {
      const hnRes = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`);
      if (hnRes.ok) {
        const hnData = await hnRes.json();
        hnPosts = hnData.hits
          .filter((hit: any) => hit.title)
          .map((hit: any) => ({
            id: `hn-${hit.objectID}`,
            platform: "hackernews",
            authorName: hit.author || "anonymous",
            authorHandle: hit.author || "anonymous",
            content: hit.title,
            url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            timestamp: hit.created_at,
            engagement: {
              likes: hit.points || 0,
              comments: hit.num_comments || 0,
              shares: 0
            },
            relevanceScore: Math.min(1.0, Math.max(0.5, (hit.points || 0) / 1000.0)),
            sentiment: "neutral" // default
          }));
      }
    } catch (e) {
      console.error("HN Fetch Error:", e);
    }

    // 2. Fetch Mocks (X, Reddit, Medium, YouTube)
    // We reuse our mock generator but filter out HN so we don't duplicate
    const allMocks = generateMockPosts(query);
    const mockPosts = allMocks.filter(p => p.platform !== "hackernews");

    // 3. Combine and sort
    const combinedResults = [...hnPosts, ...mockPosts].sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 4. Generate AI Summary & Heatmap based on the exact same logic
    const aiSummary = generateMockAISummary(query);
    
    // Calculate realistic counts
    const platformHeat = [
      { platform: "x", count: mockPosts.filter(p => p.platform === "x").length * 1500, intensity: 5 },
      { platform: "reddit", count: mockPosts.filter(p => p.platform === "reddit").length * 1200, intensity: 4 },
      { platform: "youtube", count: mockPosts.filter(p => p.platform === "youtube").length * 800, intensity: 3 },
      { platform: "hackernews", count: hnPosts.length * 500, intensity: 3 },
      { platform: "medium", count: mockPosts.filter(p => p.platform === "medium").length * 300, intensity: 2 },
    ].sort((a, b) => b.count - a.count);

    return NextResponse.json({
      query,
      results: combinedResults,
      aiSummary,
      platformHeat
    });

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
