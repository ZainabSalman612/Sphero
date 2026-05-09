import httpx
from typing import List
from datetime import datetime
from app.adapters.base import PlatformAdapter
from app.schemas.search import UnifiedPost, Engagement

class HackerNewsAdapter(PlatformAdapter):
    platform_name = "hackernews"
    base_url = "https://hn.algolia.com/api/v1/search"

    async def search(self, query: str, limit: int = 10) -> List[UnifiedPost]:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.base_url,
                    params={"query": query, "hitsPerPage": limit, "tags": "story"}
                )
                response.raise_for_status()
                data = response.json()
                
                posts = []
                for hit in data.get("hits", []):
                    # Ensure we have minimum required data
                    if not hit.get("title"):
                        continue
                        
                    url = hit.get("url") or f"https://news.ycombinator.com/item?id={hit['objectID']}"
                    points = hit.get("points", 0)
                    comments = hit.get("num_comments", 0)
                    author = hit.get("author", "anonymous")
                    
                    # Compute a naive relevance score based on points
                    relevance = min(1.0, max(0.5, points / 1000.0))
                    
                    post = UnifiedPost(
                        id=f"hn-{hit['objectID']}",
                        platform=self.platform_name,
                        authorName=author,
                        authorHandle=author,
                        content=hit["title"],
                        url=url,
                        timestamp=hit["created_at"],
                        engagement=Engagement(
                            likes=points,
                            comments=comments,
                            shares=0
                        ),
                        relevanceScore=relevance
                    )
                    posts.append(post)
                return posts
            except Exception as e:
                print(f"HN Adapter error: {e}")
                return []
