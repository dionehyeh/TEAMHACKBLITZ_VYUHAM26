# Frontend-to-Backend API Contract

This document provides the exact REST API specification consumed by the BizContext AI Next.js frontend (`apps/web`). It is designed specifically for the backend developer building the Hono API server in `apps/api`.

---

## 1. Gateway Configuration

- **Default API Base URL**: `http://localhost:3001/api/v1`
- **Environment Variable**: `NEXT_PUBLIC_API_URL`
- **Frontend Behavior**:
  - The frontend automatically tests connection health via `GET /health`.
  - When the backend responds with HTTP 200, the frontend immediately switches to **Live API Mode** (indicated by 🟢 in the header).
  - If the backend is offline or returns an error, the frontend seamlessly operates in **Demo/Mock Mode** using persistent localStorage, so workflows never fail.

---

## 2. API Endpoints Specification

### 2.1 Health Check
- **`GET /health`**
  - **Response**: `{ "status": "ok", "version": "0.1.0", "timestamp": "..." }`

---

### 2.2 Organisations & Departments
- **`GET /organisations`**
  - **Response**: Array of `Organisation` objects:
    ```json
    [
      {
        "id": "org-1",
        "name": "Vyuham Enterprises Inc.",
        "slug": "vyuham-corp",
        "parentId": null,
        "subsidiariesCount": 2,
        "departmentsCount": 5,
        "membersCount": 48
      }
    ]
    ```
- **`GET /departments`**
  - **Response**: Array of `Department` objects:
    ```json
    [
      { "id": "dept-1", "name": "AI Engineering & Research", "leadName": "Priya Sharma", "memberCount": 14 }
    ]
    ```

---

### 2.3 Employees & People Intelligence
- **`GET /employees`**
  - Returns employee directory records with verified skill arrays.
- **`GET /employees/:id`**
  - Returns single employee profile.
- **`POST /employees`**
  - Creates a new employee record.
  - **Payload**: `EmployeeProfile` object.
- **`POST /employees/parse-cv`**
  - Multi-modal / LLM resume extraction.
  - **Payload**: `{ "fileName": "candidate.pdf", "rawText": "..." }`
  - **Response**:
    ```json
    {
      "name": "Candidate Name",
      "email": "email@example.com",
      "skills": ["Rust", "Distributed Systems", "Playwright"],
      "experienceYears": 5,
      "education": "B.Tech Computer Science",
      "summary": "Professional overview..."
    }
    ```

---

### 2.4 Knowledge Base
- **`GET /knowledge/pages`**
  - Returns list of knowledge pages.
- **`GET /knowledge/pages/:id`**
  - Returns single knowledge page with markdown content.
- **`POST /knowledge/pages`**
  - **Payload**:
    ```json
    {
      "title": "Incident Post-Mortem Guidelines",
      "content": "# Markdown content...",
      "summary": "Brief executive summary...",
      "visibility": "internal",
      "tags": ["incident", "devops"]
    }
    ```
- **`PATCH /knowledge/pages/:id`**
  - Updates title or content of an existing page.

---

### 2.5 Projects & Tasks (Kanban)
- **`GET /projects`**
  - Returns all active projects with milestone progress percentages.
- **`POST /projects`**
  - Creates a new initiative / project.
- **`GET /tasks`** (Optional query: `?projectId=proj-1`)
  - Returns tasks for the Kanban board.
- **`POST /tasks`**
  - Creates a new task.
  - **Payload**:
    ```json
    {
      "title": "Benchmark hybrid retrieval latency",
      "description": "Details...",
      "projectId": "proj-1",
      "assigneeName": "Priya Sharma",
      "priority": "high",
      "status": "open",
      "dueDate": "2026-11-10"
    }
    ```
- **`PATCH /tasks/:id/status`**
  - Updates task lane in Kanban.
  - **Payload**: `{ "status": "open" | "in_progress" | "in_review" | "blocked" | "done" }`

---

### 2.6 Tickets & SLA
- **`GET /tickets`**
  - Returns ticket queue with SLA deadlines.
- **`POST /tickets`**
  - Submits an internal request.
  - **Payload**:
    ```json
    {
      "title": "MinIO S3 presigned URL CORS error",
      "description": "Details...",
      "category": "infrastructure",
      "priority": "urgent"
    }
    ```
- **`PATCH /tickets/:id/status`**
  - Updates ticket status (`open`, `in_progress`, `resolved`, `closed`).
- **`POST /tickets/:id/comments`**
  - Appends discussion or resolution note.

---

### 2.7 Meetings & Minutes (AI Action Item Extractor)
- **`GET /meetings`**
  - Returns list of past and scheduled meetings.
- **`POST /meetings/:id/extract-action-items`**
  - Analyzes raw transcript or OCR text to detect actionable items.
  - **Response**:
    ```json
    {
      "id": "meet-1",
      "extractedActionItems": [
        {
          "id": "act-1",
          "title": "Integrate B3 human approval drawer",
          "assignee": "Elena Rostova",
          "dueDate": "2026-10-31",
          "priority": "urgent",
          "convertedToTask": false
        }
      ]
    }
    ```

---

### 2.8 Communication & Channels
- **`GET /channels`**
  - Returns chat channels (`#general`, `#engineering`, etc.).
- **`GET /channels/:id/messages`**
  - Returns message history for the channel.
- **`POST /channels/:id/messages`**
  - Sends a message. If `@BizContext` is mentioned, the server or copilot should respond.

---

### 2.9 Agent Registry & Autonomous Browser Jobs
- **`GET /agents`**
  - Returns registered agents with model and B0-B4 permission levels.
- **`POST /agents`**
  - Registers a new autonomous agent.
- **`GET /browser-jobs`**
  - Returns browser automation job queue.
- **`POST /browser-jobs`**
  - Launches a new Playwright job in the container sandbox.
- **`POST /browser-jobs/:id/approve`**
  - Human-in-the-loop supervisor decision.
  - **Payload**: `{ "decision": "approved" | "rejected" }`

---

### 2.10 Hybrid Second Brain Search
- **`POST /search/ask-second-brain`**
  - Queries pgvector embeddings + BM25 keyword index.
  - **Payload**: `{ "query": "What are our B3 browser approval rules?" }`
  - **Response**:
    ```json
    {
      "answer": "According to organizational documents...",
      "sources": [
        {
          "title": "Browser Agent Security Guidelines",
          "category": "Security Policy",
          "matchConfidence": 96.4,
          "link": "/knowledge"
        }
      ],
      "suggestedActions": [
        { "label": "View Browser Approval Queue", "actionType": "navigate", "payload": "/browser-jobs" }
      ]
    }
    ```

---

### 2.11 Employee Documents (CVs, Certificates, Portfolios)
- **`GET /employee-documents`**
  - Query params: `page`, `limit`, `employeeProfileId`, `documentType`, `verificationStatus`.
  - Returns paginated list of employee documents scoped by caller's role (admins/owners see all org docs; members see own).
- **`POST /employee-documents/upload-url`**
  - Generates a short-lived presigned upload URL for direct Supabase Storage upload.
  - **Payload**:
    ```json
    {
      "employeeProfileId": "00000000-0000-0000-0000-000000000000",
      "documentType": "cv",
      "title": "Senior Engineer Resume 2026",
      "description": "Updated resume highlighting Rust & Distributed Systems",
      "filename": "candidate_resume.pdf",
      "mimeType": "application/pdf",
      "byteSize": 1048576,
      "visibility": "restricted"
    }
    ```
- **`POST /employee-documents/:documentId/confirm`**
  - Marks document upload as completed and sets extraction status to `pending`.
- **`GET /employee-documents/:documentId`**
  - Returns metadata for a single document and creates an audit log entry (`view`).
- **`GET /employee-documents/:documentId/download-url`**
  - Generates a 5-minute signed download URL and creates an audit log entry (`download`).
- **`PATCH /employee-documents/:documentId`**
  - Updates title, description, or visibility (`restricted` | `internal`).
- **`POST /employee-documents/:documentId/verify`**
  - Reviewer verification / rejection action (restricted to admin, owner, or hr roles).
  - **Payload**: `{ "status": "verified" | "rejected", "notes": "Optional notes" }`
- **`POST /employee-documents/:documentId/extract`**
  - Triggers or records AI extraction results for the document.
- **`DELETE /employee-documents/:documentId`**
  - Soft-deletes the document and creates an audit log entry (`delete`).
- **`GET /employee-documents/employee/:employeeProfileId`**
  - Lists documents belonging to a specific employee profile.

---

### 2.12 Asset Storage & Files
- **`GET /files`**
  - Query params: `page`, `limit`, `projectId`, `folderPath`, `visibility`, `mimeType`, `search`.
  - Returns array of `StoredFile` objects, filtered by user visibility and permissions.
- **`POST /files/upload-url`**
  - Generates a short-lived presigned upload URL for direct Supabase Storage upload.
  - **Payload**:
    ```json
    {
      "filename": "document.pdf",
      "mimeType": "application/pdf",
      "byteSize": 1048576,
      "visibility": "internal",
      "folderPath": "/engineering",
      "tags": ["spec"]
    }
    ```
- **`POST /files`**
  - Registers a file asset directly with metadata.
- **`POST /files/:fileId/confirm`**
  - Marks file upload as completed, creating version 1 in `file_versions`.
- **`GET /files/:fileId`**
  - Returns file metadata and logs a `view` audit event.
- **`GET /files/:fileId/download-url`**
  - Generates a 15-minute expiring signed download URL and logs a `download` audit event.
- **`PATCH /files/:fileId`**
  - Updates filename, folderPath, visibility, tags, summary, or projectId.
- **`DELETE /files/:fileId`**
  - Soft-deletes file and logs a `delete` audit event.
- **`GET /files/:fileId/versions`**
  - Returns list of historical versions for the file.
- **`POST /files/:fileId/permissions`**
  - Grants explicit permissions (`view`, `download`, `edit`, `admin`) to user, role, or department.
- **`POST /files/:fileId/ocr`**
  - Triggers or stores extracted OCR text and document summary.
