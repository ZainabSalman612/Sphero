from fastapi import APIRouter, Depends, Query
from app.schemas.search import SearchResponse
from app.services.search_service import SearchService

router = APIRouter()

# Dependency
def get_search_service() -> SearchService:
    return SearchService()

@router.get("/", response_model=SearchResponse)
async def search_platforms(
    q: str = Query(..., min_length=2, description="Search query"),
    service: SearchService = Depends(get_search_service)
):
    """
    Search across multiple social platforms concurrently and return aggregated, AI-summarized results.
    """
    return await service.execute_search(q)
