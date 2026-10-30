# Notifications & Preferences API Specification

**Base Route:** `/api/v1/notifications`  
**Security & Access Control:** Bearer JWT required. Multi-tenant organisation scoping and recipient isolation enforced on every request.  
**Reference:** IMPLEMENTATION.md Sections 2.9, 8.3, and 11; Migration `006_notifications_and_preferences.sql`.

---

## 1. Overview & Architecture

The `/api/v1/notifications` endpoint group provides the in-app notification centre and user delivery preferences for BizContext AI.

### Core Principles
1. **Recipient Privacy:** Notifications are strictly scoped to the authenticated user within their organisation. Users cannot view or modify notifications belonging to other members.
2. **Channel & Event Preferences:** Users configure delivery preferences by channel (in-app, email) and event category (`task`, `ticket`, `mention`, `approval`, `system`, etc.). Notifications are verified against user preferences before dispatch.
3. **Real-time Badge Updates:** Fast `GET /notifications/unread-count` endpoint allows lightweight polling or badge updates for navigation headers.
4. **Deep Linking:** Notifications include `linkUrl`, `resourceType`, and `resourceId` to enable seamless in-app navigation to relevant tasks, tickets, meetings, or documents.
5. **Dismissal & Read Lifecycle:** Supports individual read markers, bulk mark-all-read (`PATCH /notifications/read-all`), and soft-deletion dismissal.

---

## 2. Endpoints

### 2.1 List Notifications
- **`GET /api/v1/notifications`**
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 50, max: 100)
  - `isRead` (boolean, optional)
  - `category` (`task` | `ticket` | `mention` | `meeting` | `approval` | `system` | `project` | `document` | `agent`, optional)
- **Response:**
  ```json
  {
    "data": [
      {
        "id": "notif-uuid",
        "organisationId": "00000000-0000-0000-0000-000000000001",
        "recipientId": "00000000-0000-0000-0000-000000000002",
        "actorId": "00000000-0000-0000-0000-000000000003",
        "actorName": "Marcus Vance",
        "category": "ticket",
        "title": "New comment on TICK-1045",
        "body": "Marcus Vance commented on 'MinIO S3 presigned URL CORS error'",
        "linkUrl": "/tickets",
        "resourceType": "ticket",
        "resourceId": "ticket-uuid",
        "priority": "normal",
        "isRead": false,
        "readAt": null,
        "metadata": { "ticketNumber": "TICK-1045" },
        "createdAt": "2026-10-30T14:30:00Z"
      }
    ],
    "unreadCount": 1,
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

---

### 2.2 Get Unread Count
- **`GET /api/v1/notifications/unread-count`**
- **Response (200 OK):**
  ```json
  {
    "unreadCount": 3
  }
  ```

---

### 2.3 Mark Single Notification as Read
- **`PATCH /api/v1/notifications/:id/read`**
- **Response (200 OK):** Returns the updated `AppNotification` with `isRead: true` and `readAt` timestamp.

---

### 2.4 Mark All Notifications as Read
- **`PATCH /api/v1/notifications/read-all`**
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "timestamp": "2026-10-30T14:35:00.000Z"
  }
  ```

---

### 2.5 Dispatch Notification
- **`POST /api/v1/notifications`**
- **Request Body:**
  ```json
  {
    "recipientId": "00000000-0000-0000-0000-000000000002",
    "category": "task",
    "title": "Task Assigned: Implement notifications API",
    "body": "You were assigned to benchmark hybrid retrieval latency",
    "linkUrl": "/tasks",
    "resourceType": "task",
    "resourceId": "task-uuid",
    "priority": "high"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "data": { ... },
    "delivered": true
  }
  ```

---

### 2.6 Dismiss / Soft-Delete Notification
- **`DELETE /api/v1/notifications/:id`**
- **Response (200 OK):** `{ "success": true }`

---

### 2.7 Get User Notification Preferences
- **`GET /api/v1/notifications/preferences`**
- **Response (200 OK):**
  ```json
  {
    "data": {
      "id": "pref-uuid",
      "organisationId": "org-uuid",
      "userId": "user-uuid",
      "emailNotifications": true,
      "inAppNotifications": true,
      "taskAssigned": true,
      "ticketUpdates": true,
      "mentions": true,
      "approvalRequests": true,
      "systemAnnouncements": true,
      "dailyDigest": false,
      "updatedAt": "2026-10-30T12:00:00Z"
    }
  }
  ```

---

### 2.8 Update Notification Preferences
- **`PUT /api/v1/notifications/preferences`**
- **Request Body:**
  ```json
  {
    "emailNotifications": false,
    "inAppNotifications": true,
    "dailyDigest": true
  }
  ```
- **Response (200 OK):** Updated preferences object.
