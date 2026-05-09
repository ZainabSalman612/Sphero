from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import search

app = FastAPI(
    title="Sphero API",
    description="Backend for Sphero AI-Powered Social Search",
    version="1.0.0"
)

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api/v1/search", tags=["search"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
