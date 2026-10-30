# Tickets & SLA API Specification

**Base Route:** `/api/v1/tickets`  
**Security & Access Control:** Bearer JWT required. Multi-tenant organisation scoping and role/resource-level permissions enforced on every request.  
**Reference:** IMPLEMENTATION.md Sections 2.7, 8.3, 10.3, and 11; Migration `005_tickets_and_sla.sql`.

---

## 1. Overview & Architecture

The `/api/v1/tickets` endpoint group implements the internal helpdesk and SLA dispatch system for BizContext AI.

### Core Principles
1. **Lifecycle Progression:** `open` → `assigned` → `acknowledged` → `in_progress` → `waiting` → `resolved` → `closed` (with support for `reopened`).
2. **Dynamic SLA Engine:**
   - **Urgent**: 4 hours deadline
   - **High**: 12 hours deadline
   - **Medium**: 24 hours deadline
   - **Low**: 72 hours deadline
   - Real-time `slaBreached` detection when current time passes deadline on non-resolved tickets.
3. **Collaboration & Discussion:** Real-time discussion thread via `ticket_comments` supporting both public and internal staff notes.
4. **Audit Trail & Activity Logging:** Transitions, assignment updates, comments, and status changes are captured in `ticket_activity` and append-only `audit_logs`.
5. **AI Routing Suggestions:** Automatic category-to-department recommendations (IT, access, infrastructure, HR, design, dev, finance, general).

---

## 2. Endpoints

### 2.1 List Tickets
- **`GET /api/v1/tickets`**
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 50)
  - `category` (`it` | `access` | `infrastructure` | `hr` | `design` | `dev` | `finance` | `general`, optional)
  - `priority` (`low` | `medium` | `high` | `urgent`, optional)
  - `status` (`open` | `assigned` | `acknowledged` | `in_progress` | `waiting` | `resolved` | `closed` | `reopened`, optional)
  - `assigneeId` (UUID, optional)
  - `requesterId` (UUID, optional)
  - `search` (string, optional — searches title and description)
- **Response:**
  ```json
  [
    {
      "id": "tick-1",
      "organisationId": "00000000-0000-0000-0000-000000000001",
      "ticketNumber": "TICK-1045",
      "title": "MinIO S3 presigned URL CORS error",
      "description": "Cross-origin requests from web client rejected during asset uploads",
      "category": "infrastructure",
      "priority": "urgent",
      "status": "in_progress",
      "requesterId": "00000000-0000-0000-0000-000000000002",
      "requesterName": "Adhwaithas S.",
      "assigneeId": "00000000-0000-0000-0000-000000000003",
      "assigneeName": "Marcus Vance",
      "departmentId": null,
      "slaTarget": "2026-10-31T02:00:00.000Z",
      "slaBreached": false,
      "comments": [
        {
          "id": "comm-1",
          "author": "Marcus Vance",
          "text": "Investigating the S3 bucket CORS configuration.",
          "isInternal": false,
          "createdAt": "2026-10-30T14:00:00Z"
        }
      ],
      "createdAt": "2026-10-30T12:00:00Z",
      "updatedAt": "2026-10-30T14:00:00Z"
    }
  ]
  ```

---

### 2.2 Create Ticket
- **`POST /api/v1/tickets`**
- **Request Body:**
  ```json
  {
    "title": "MinIO S3 presigned URL CORS error",
    "description": "Details about the error...",
    "category": "infrastructure",
    "priority": "urgent",
    "assigneeId": "00000000-0000-0000-0000-000000000003"
  }
  ```
- **Response (201 Created):** Full created `Ticket` object with generated `ticketNumber` and calculated `slaTarget`.

---

### 2.3 Get Ticket Details
- **`GET /api/v1/tickets/:id`**
- **Response (200 OK):** Single ticket object with full comment thread and SLA status.

---

### 2.4 Update Ticket Status
- **`PATCH /api/v1/tickets/:id/status`**
- **Request Body:**
  ```json
  {
    "status": "resolved",
    "resolutionNotes": "Updated MinIO CORS configuration to permit localhost:3000 origin"
  }
  ```
- **Response (200 OK):** Updated `Ticket` object.

---

### 2.5 Update Ticket Details
- **`PATCH /api/v1/tickets/:id`**
- **Request Body:**
  ```json
  {
    "title": "Updated Title",
    "priority": "high",
    "assigneeId": "00000000-0000-0000-0000-000000000004"
  }
  ```
- **Response (200 OK):** Updated `Ticket` object.

---

### 2.6 Add Discussion Comment
- **`POST /api/v1/tickets/:id/comments`**
- **Request Body:**
  ```json
  {
    "text": "Applied configuration fix and verified upload flow.",
    "isInternal": false
  }
  ```
- **Response (201 Created):** Updated `Ticket` object with new comment appended.

---

### 2.7 View Ticket Lifecycle Activity
- **`GET /api/v1/tickets/:id/activity`**
- **Response (200 OK):** Array of activity entries from `ticket_activity`.

---

### 2.8 Delete Ticket (Soft-Delete)
- **`DELETE /api/v1/tickets/:id`**
- **Response (200 OK):** `{ "success": true }`
