# Files & Asset Storage API Specification

**Base Route:** `/api/v1/files`  
**Security & Access Control:** Bearer JWT required. Multi-tenant organisation scoping, visibility filtering, and resource-level permissions enforced on every request.  
**Reference:** IMPLEMENTATION.md Sections 2.4, 8.2, and 11; Migration `004_asset_storage_files.sql`.

---

## 1. Overview & Architecture

The `/api/v1/files` endpoint group implements the central document and asset storage repository for BizContext AI.

### Core Principles
1. **Private Object Storage:** File bytes are held in private object storage (`assets` bucket). Direct object paths are never exposed publicly. Access is strictly gated through short-lived presigned URLs.
2. **Presigned Upload Flow:**
   1. Client calls `POST /api/v1/files/upload-url` (or `POST /api/v1/files`) with file metadata.
   2. Server validates MIME type (strict allowlist), byte size (up to 100 MB), and creates a metadata record in PostgreSQL.
   3. Server generates a signed upload URL via Supabase Storage.
   4. Client PUTs the file bytes directly to the signed upload URL.
   5. Client calls `POST /api/v1/files/:fileId/confirm` to record upload completion and create version 1 in `file_versions`.
3. **Multi-Level Visibility:**
   - `public`: Accessible to everyone within the organisation.
   - `internal`: Accessible to all authenticated members of the organisation.
   - `restricted`: Accessible only to the creator, organisation admins/owners, or users granted explicit access via `file_permissions`.
4. **Audit Trail:** Sensitive actions (`view`, `download`, `upload`, `edit`, `delete`, `share`, `ocr_extraction`) are automatically recorded in the append-only `audit_logs` table.
5. **OCR & Text Extraction:** Files support optical character recognition, automated summaries, and downstream ingestion into pgvector embeddings.

---

## 2. Endpoints

### 2.1 List Files
- **`GET /api/v1/files`**
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
  - `projectId` (UUID, optional)
  - `folderPath` (string, optional, e.g. `/security`)
  - `visibility` (`public` | `internal` | `restricted`, optional)
  - `mimeType` (string, optional)
  - `search` (string, optional — searches filename)
- **Response:**
  ```json
  [
    {
      "id": "file-1",
      "organisationId": "00000000-0000-0000-0000-000000000001",
      "projectId": null,
      "filename": "BizContext_Enterprise_Architecture_v1.pdf",
      "folderPath": "/",
      "byteSize": 3450200,
      "mimeType": "application/pdf",
      "storagePath": "org-00000000/assets/uuid/architecture_v1.pdf",
      "isUploadConfirmed": true,
      "visibility": "internal",
      "tags": ["architecture", "spec"],
      "summary": "Enterprise design baseline",
      "ocrStatus": "completed",
      "createdBy": "00000000-0000-0000-0000-000000000002",
      "uploadedByName": "Adhwaithas S.",
      "downloadUrl": "/api/v1/files/file-1/download-url",
      "createdAt": "2026-10-25T11:00:00Z",
      "updatedAt": "2026-10-25T11:00:00Z"
    }
  ]
  ```

---

### 2.2 Request Presigned Upload URL
- **`POST /api/v1/files/upload-url`**
- **Request Body:**
  ```json
  {
    "filename": "Q4_Financial_Model.xlsx",
    "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "byteSize": 2048500,
    "visibility": "internal",
    "folderPath": "/finance",
    "tags": ["finance", "forecast", "2026"],
    "summary": "Q4 operating forecast"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "data": {
      "fileId": "file-uuid",
      "storagePath": "org-00000000/assets/finance/uuid/Q4_Financial_Model.xlsx",
      "uploadUrl": "https://storage.supabase.co/object/upload/sign/assets/...",
      "expiresIn": 3600,
      "file": { ... }
    }
  }
  ```

---

### 2.3 Direct File Registration / Upload
- **`POST /api/v1/files`**
- **Request Body:**
  ```json
  {
    "filename": "Sprint_26_Evaluation_Matrix.pdf",
    "mimeType": "application/pdf",
    "byteSize": 2104500,
    "visibility": "internal"
  }
  ```
- **Response (201 Created):**
  Returns the created `StoredFile` object, automatically recording version 1 and an `upload` audit log entry.

---

### 2.4 Confirm Upload Completion
- **`POST /api/v1/files/:fileId/confirm`**
- **Request Body (optional):**
  ```json
  {
    "storagePath": "org-00000000/assets/finance/uuid/Q4_Financial_Model.xlsx"
  }
  ```
- **Response (200 OK):**
  Returns updated file with `isUploadConfirmed: true` and logs `confirm_upload` audit entry.

---

### 2.5 Get File Metadata
- **`GET /api/v1/files/:fileId`**
- **Behavior:** Enforces read permission; logs `view` event in `audit_logs`.
- **Response (200 OK):** File metadata object.

---

### 2.6 Generate Presigned Download URL
- **`GET /api/v1/files/:fileId/download-url`**
- **Behavior:** Enforces download permission; generates a 15-minute (900 seconds) signed URL from private storage; logs `download` event in `audit_logs`.
- **Response (200 OK):**
  ```json
  {
    "data": {
      "fileId": "file-uuid",
      "filename": "Sprint_26_Evaluation_Matrix.pdf",
      "downloadUrl": "https://storage.supabase.co/object/sign/assets/...",
      "expiresIn": 900
    }
  }
  ```

---

### 2.7 Update File Metadata
- **`PATCH /api/v1/files/:fileId`**
- **Request Body:**
  ```json
  {
    "filename": "Sprint_26_Evaluation_Matrix_v2.pdf",
    "folderPath": "/engineering/sprints",
    "visibility": "restricted",
    "tags": ["sprint26", "evaluation"]
  }
  ```
- **Response (200 OK):** Updated file record.

---

### 2.8 Soft-Delete File
- **`DELETE /api/v1/files/:fileId`**
- **Behavior:** Sets `deleted_at: NOW()`; logs `delete` event in `audit_logs`.
- **Response (200 OK):** `{ "success": true }`

---

### 2.9 Version History
- **`GET /api/v1/files/:fileId/versions`**
- **Response (200 OK):** Array of historical versions from `file_versions`.

---

### 2.10 Grant File Permissions (Sharing)
- **`POST /api/v1/files/:fileId/permissions`**
- **Request Body:**
  ```json
  {
    "granteeType": "user",
    "granteeId": "00000000-0000-0000-0000-000000000003",
    "permission": "view"
  }
  ```
- **Response (201 Created):** Created permission grant.

---

### 2.11 OCR & Document Summarization
- **`POST /api/v1/files/:fileId/ocr`**
- **Request Body (optional):**
  ```json
  {
    "ocrText": "Parsed textual content from scanned document...",
    "summary": "AI summary of key items..."
  }
  ```
- **Response (200 OK):** Updated file record with `ocr_status: "completed"`.
