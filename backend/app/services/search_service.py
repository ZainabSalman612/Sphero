import asyncio
import random
from typing import List, Dict, Any
from app.schemas.search import UnifiedPost, AISummaryData, PlatformHeat, SearchResponse
import os
import json
import google.generativeai as genai
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
        
        # Initialize Gemini
        genai.configure(api_key=os.getenv("GOOGLE_GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-1.5-flash')

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
        
        # Generate AI Summary
        try:
            ai_summary = await self._generate_real_summary(query, all_posts)
        except Exception as e:
            print(f"Error generating real AI summary: {e}")
            ai_summary = self._generate_mock_summary(query, all_posts)
        
        return SearchResponse(
            query=query,
            results=all_posts,
            aiSummary=ai_summary,
            platformHeat=heat_data
        )
        
    async def _generate_real_summary(self, query: str, posts: List[UnifiedPost]) -> AISummaryData:
        """
        Calls Google Gemini to generate a real summary based on the aggregated posts.
        """
        if not posts:
            return self._generate_mock_summary(query, [])

        # Prepare the context for the LLM
        context_lines = []
        for p in posts[:15]:
            context_lines.append(f"[{p.platform.upper()}] {p.authorName}: {p.content}")
        
        context_text = "\n".join(context_lines)
        
        prompt = f"""
        You are an expert social media analyst for Sphero, an AI-powered social intelligence engine.
        Analyze the following recent social media posts about '{query}' and provide a structured summary in JSON format.
        
        POSTS:
        {context_text}
        
        The JSON must match this structure:
        {{
            "overallSummary": "A concise 2-3 sentence overview of the discussion.",
            "keyOpinions": ["List of 3 distinct viewpoints or opinions shared by users"],
            "trendingNarratives": ["List of 2-3 emerging stories or topics within the discussion"],
            "sentimentBreakdown": {{
                "positive": percentage_as_int,
                "negative": percentage_as_int,
                "neutral": percentage_as_int
            }},
            "controversialTakes": ["List of 2 controversial or hot takes found in the posts"]
        }}
        
        Ensure the sentiment percentages sum to 100.
        Provide ONLY the raw JSON. Do not include any markdown formatting like ```json.
        """

        # Gemini 1.5 Flash is fast and good for this
        response = await self.model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        if not response.text:
            raise ValueError("Empty response from Gemini")
            
        data = json.loads(response.text)
        return AISummaryData.model_validate(data)

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
