# BizContext AI - AI Engine Service

Python/FastAPI service for intelligence operations:
- **RAG & Hybrid Search:** PostgreSQL full-text search combined with `pgvector` semantic retrieval.
- **Document & CV Extraction:** PyMuPDF, python-docx, OCR integration for structured CV and minutes extraction.
- **Agent Orchestrator:** Tool management, context injection, guardrails, and citation verification.

## Setup & Running

```bash
cd apps/ai-engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
