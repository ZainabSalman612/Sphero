import asyncio
import random
from datetime import datetime, timedelta
from typing import List
from app.adapters.base import PlatformAdapter
from app.schemas.search import UnifiedPost, Engagement

class MockAdapter(PlatformAdapter):
    def __init__(self, platform_name: str, delay_ms: int = 500):
        self.platform_name = platform_name
        self.delay_ms = delay_ms

    async def search(self, query: str, limit: int = 5) -> List[UnifiedPost]:
        await asyncio.sleep(self.delay_ms / 1000.0)
        
        posts = []
        for i in range(limit):
            # Deterministic pseudo-random based on query to keep it somewhat stable
            seed = sum(ord(c) for c in query) + i
            random.seed(seed)
            
            # Use data somewhat specific to platform
            sentiment = random.choice(["positive", "negative", "neutral", "mixed"])
            likes = random.randint(10, 50000)
            comments = int(likes * random.uniform(0.01, 0.2))
            shares = int(likes * random.uniform(0.05, 0.3))
            
            post = UnifiedPost(
                id=f"{self.platform_name}-mock-{i}",
                platform=self.platform_name,
                authorName=f"User{random.randint(100, 999)}",
                authorHandle=f"@user_{self.platform_name}_{i}",
                content=self._generate_mock_content(query),
                url=f"https://{self.platform_name}.com/post/{i}",
                timestamp=(datetime.utcnow() - timedelta(hours=random.randint(1, 48))).isoformat() + "Z",
                engagement=Engagement(
                    likes=likes,
                    comments=comments,
                    shares=shares
                ),
                sentiment=sentiment,
                relevanceScore=random.uniform(0.6, 0.99)
            )
            posts.append(post)
            
        return sorted(posts, key=lambda x: x.relevanceScore, reverse=True)
        
    def _generate_mock_content(self, query: str) -> str:
        templates = [
            f"Just read an interesting piece on {query}. The implications are massive.",
            f"Can anyone explain {query} to me like I'm 5? Asking for a friend.",
            f"Unpopular opinion: {query} is completely overhyped and we'll forget about it in 6 months.",
            f"I've been working with {query} for the past week. Here's a thread of what I've learned 🧵",
            f"The pivot to {query} is going to break a lot of existing systems if we aren't careful."
        ]
        return random.choice(templates)
