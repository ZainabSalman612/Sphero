from abc import ABC, abstractmethod
from typing import List, Optional
from app.schemas.search import UnifiedPost

class PlatformAdapter(ABC):
    platform_name: str
    
    @abstractmethod
    async def search(self, query: str, limit: int = 10) -> List[UnifiedPost]:
        """Fetch posts matching the query from the specific platform."""
        pass
