# Architecture Documentation

BizContext AI is an AI-powered Business Second Brain and organisational operating workspace.

## System Components
1. **Frontend (`apps/web`):** Next.js App Router, React, TypeScript.
2. **Main API (`apps/api`):** Fast, lightweight Hono API running on Bun.
3. **AI Engine (`apps/ai-engine`):** Python/FastAPI service for RAG, CV extraction, meeting action-item extraction, and agent orchestration.
4. **Browser Worker (`apps/browser-worker`):** Isolated Playwright browser automation worker with strict domain allowlists and human-in-the-loop approval gating.
5. **Shared Packages (`packages/*`):** UI, Database, Auth, Permissions, Types, Agent SDK, Integrations, Validation.
6. **Domain Modules (`modules/*`):** Organisations, Employees, Knowledge, Storage, Communication, Projects, Tasks, Tickets, Meetings, Notifications, Agents, Browser Jobs, Analytics, Administration.
7. **Workers (`workers/*`):** Ingestion, Embeddings, Integrations Sync, Notifications, Scheduled Jobs.
