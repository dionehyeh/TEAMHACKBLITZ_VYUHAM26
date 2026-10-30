# AI Engine Planning & Integration Documentation

This folder contains architectural blueprints, API contracts, and implementation guides for integrating the standalone **BizContext AI Engine** with the **BizContext Backend Service** (`apps/api`).

## Documents

- [**BACKEND_INTEGRATION.md**](./BACKEND_INTEGRATION.md): Complete guide for the Backend team:
  - Architecture overview & sequence flow diagrams
  - AI Engine API specifications (`/api/v1/agent/run`, `/api/v1/agent/stream`)
  - Backend Second Brain & Tool execution endpoints required
  - Complete Hono / TypeScript service & route implementation
  - Security, RBAC & Multi-tenancy context propagation rules
  - Verification & testing checklist
