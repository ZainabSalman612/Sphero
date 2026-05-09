import asyncio
import random
from typing import List, Dict, Any
from app.schemas.search import UnifiedPost, AISummaryData, PlatformHeat, SearchResponse
from app.adapters.hackernews import HackerNewsAdapter
from app.adapters.mock import MockAdapter

class SearchService:
    def __init__(self):
        # Initialize adapters
        self.adapters = [
            HackerNewsAdapter(),
            MockAdapter("reddit", delay_ms=400),
            MockAdapter("x", delay_ms=600),
            MockAdapter("youtube", delay_ms=800),
            MockAdapter("medium", delay_ms=500),
        ]

    async def execute_search(self, query: str) -> SearchResponse:
        """
        Orchestrates calling all platform adapters concurrently,
        aggregates results, and generates AI summaries.
        """
        # Call all adapters concurrently
        tasks = [adapter.search(query, limit=5) for adapter in self.adapters]
        results_lists = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_posts: List[UnifiedPost] = []
        platform_counts: Dict[str, int] = {}
        
        for idx, result in enumerate(results_lists):
            if isinstance(result, Exception):
                print(f"Error from adapter {self.adapters[idx].platform_name}: {result}")
                continue
                
            all_posts.extend(result)
            platform_counts[self.adapters[idx].platform_name] = len(result)
            
        # Sort all posts by relevance
        all_posts.sort(key=lambda x: x.relevanceScore, reverse=True)
        
        # Generate platform heat
        heat_data = []
        for platform, count in platform_counts.items():
            # Mocking intensity and inflated total counts for realistic UI
            base_count = count * random.randint(100, 1000)
            heat_data.append(PlatformHeat(
                platform=platform,
                count=base_count,
                intensity=min(5, max(1, int(base_count / 1000)))
            ))
            
        heat_data.sort(key=lambda x: x.count, reverse=True)
        
        # Generate AI Summary (Mocked for now since no OpenAI key)
        ai_summary = self._generate_mock_summary(query, all_posts)
        
        return SearchResponse(
            query=query,
            results=all_posts,
            aiSummary=ai_summary,
            platformHeat=heat_data
        )
        
    def _generate_mock_summary(self, query: str, posts: List[UnifiedPost]) -> AISummaryData:
        # Mocking the AI summarization
        pos = sum(1 for p in posts if p.sentiment == "positive")
        neg = sum(1 for p in posts if p.sentiment == "negative")
        total = max(1, pos + neg)
        
        pos_pct = int((pos / total) * 100) if total > 0 else 50
        neg_pct = int((neg / total) * 100) if total > 0 else 20
        neu_pct = 100 - pos_pct - neg_pct
        
        return AISummaryData(
            overallSummary=f"Analysis of {len(posts)} recent posts across multiple platforms shows a highly engaged discussion around '{query}'. The general sentiment leans towards exploring practical implications while remaining cautious of hype.",
            keyOpinions=[
                f"Significant interest in {query} from technical communities",
                "Concerns raised about long term sustainability",
                "Many users are asking for beginner-friendly resources"
            ],
            trendingNarratives=[
                f"How {query} will impact junior roles",
                f"The hidden costs of {query}"
            ],
            sentimentBreakdown={
                "positive": pos_pct,
                "negative": neg_pct,
                "neutral": neu_pct
            },
            controversialTakes=[
                f"{query} is just a rebranded version of 5-year-old tech",
                "We need strict regulation before this goes further"
            ]
        )
