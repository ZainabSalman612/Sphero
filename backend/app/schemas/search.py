from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class Engagement(BaseModel):
    likes: int
    comments: int
    shares: int
    views: Optional[int] = None

class UnifiedPost(BaseModel):
    id: str
    platform: str
    authorName: str
    authorAvatar: Optional[str] = None
    authorHandle: str
    content: str
    url: str
    deepLink: Optional[str] = None
    timestamp: str
    engagement: Engagement
    mediaUrl: Optional[str] = None
    mediaType: Optional[str] = None
    sentiment: Optional[str] = None
    relevanceScore: float

class SentimentBreakdown(BaseModel):
    positive: int
    negative: int
    neutral: int

class AISummaryData(BaseModel):
    overallSummary: str
    keyOpinions: List[str]
    trendingNarratives: List[str]
    sentimentBreakdown: SentimentBreakdown
    controversialTakes: List[str]

class PlatformHeat(BaseModel):
    platform: str
    count: int
    intensity: int

class SearchResponse(BaseModel):
    query: str
    results: List[UnifiedPost]
    aiSummary: Optional[AISummaryData] = None
    platformHeat: List[PlatformHeat]
