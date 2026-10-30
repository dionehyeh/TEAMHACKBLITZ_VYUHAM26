from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(
    title="BizContext AI Engine",
    description="Python FastAPI service handling RAG, CV extraction, meeting action-item extraction, and agent orchestration.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        service="bizcontext-ai-engine",
        version="0.1.0"
    )

@app.get("/")
async def root():
    return {
        "message": "BizContext AI Engine Operational",
        "capabilities": [
            "hybrid-retrieval",
            "cv-parsing",
            "meeting-minutes-extraction",
            "agent-orchestration",
            "embeddings"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_ENGINE_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
