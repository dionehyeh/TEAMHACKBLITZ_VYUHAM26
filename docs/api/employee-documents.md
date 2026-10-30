# Employee Documents API Specification

**Base Route:** `/api/v1/employee-documents`  
**Security & Access Control:** Bearer JWT required. Multi-tenant organisation scoping and strict RBAC enforced on every request.  
**Reference:** IMPLEMENTATION.md Sections 2.2, 8.1, 8.5 & 11; Migration `003_employee_documents.sql`.

---

## 1. Overview & Architecture

The `/api/v1/employee-documents` endpoint group manages professional documents (CVs, credentials, certifications, portfolios) attached to employee profiles.

### Key Principles
1. **Private by Default:** File bytes live in a private Supabase Storage bucket (`employee-documents`). Raw bucket paths are never exposed publicly. Access is gated via short-lived signed URLs.
2. **Presigned Upload Flow:** 
   1. Client calls `POST /api/v1/employee-documents/upload-url` with document metadata.
   2. Server validates MIME type (strict allowlist), byte size (up to 50 MB), and profile ownership. Server creates an unconfirmed metadata row (`is_upload_confirmed: false`) and returns a signed upload URL.
   3. Client uploads file bytes directly to Supabase Storage via `PUT`.
   4. Client calls `POST /api/v1/employee-documents/:documentId/confirm`. Server sets `is_upload_confirmed: true` and `extraction_status: 'pending'`.
3. **Role-Based Access Control (RBAC):**
   - **Admins & Owners:** Can view, download, update, and soft-delete all documents in their organisation.
   - **HR:** Can verify (`verified` / `rejected`) and review employee documents.
   - **Employees:** Can upload documents for their own profile and view/download documents where they are either the uploader (`created_by`) or the subject (`employee_profile_id`).
4. **Audit Logging:** Every sensitive event (`view`, `download`, `verify`, `extract`, `delete`) creates an immutable append-only record in the `audit_logs` table.
5. **Soft Deletion:** Documents are never purged directly; they are soft-deleted by populating `deleted_at`.

---

## 2. Endpoints

### 2.1 List Documents
- **`GET /api/v1/employee-documents`**
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
  - `employeeProfileId` (UUID, optional)
  - `documentType` (`cv` | `certificate` | `portfolio` | `other`, optional)
  - `verificationStatus` (`unverified` | `verified` | `rejected`, optional)
- **Response:**
  ```json
  {
    "data": [
      {
        "id": "c62b9a11-8271-4770-b749-65bc04e0e5a9",
        "organisation_id": "00000000-0000-0000-0000-000000000001",
        "employee_profile_id": "00000000-0000-0000-0000-000000000002",
        "document_type": "cv",
        "title": "Senior Engineer Resume 2026",
        "description": "Updated resume highlighting Rust and Distributed Systems",
        "filename": "resume.pdf",
        "mime_type": "application/pdf",
        "byte_size": 1048576,
        "is_upload_confirmed": true,
        "verification_status": "unverified",
        "verified_by": null,
        "verified_at": null,
        "extraction_status": "pending",
        "visibility": "restricted",
        "created_by": "00000000-0000-0000-0000-000000000003",
        "created_at": "2026-10-30T12:00:00Z",
        "updated_at": "2026-10-30T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

---

### 2.2 Request Presigned Upload URL
- **`POST /api/v1/employee-documents/upload-url`**
- **Request Body:**
  ```json
  {
    "employeeProfileId": "00000000-0000-0000-0000-000000000002",
    "documentType": "cv",
    "title": "Senior Engineer Resume 2026",
    "description": "Updated CV",
    "filename": "resume.pdf",
    "mimeType": "application/pdf",
    "byteSize": 1048576,
    "visibility": "restricted"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "data": {
      "documentId": "c62b9a11-8271-4770-b749-65bc04e0e5a9",
      "storagePath": "org-00000000/employee-docs/00000002/uuid/resume.pdf",
      "uploadUrl": "https://storage.supabase.co/object/upload/sign/employee-documents/...",
      "expiresIn": 3600
    }
  }
  ```

---

### 2.3 Confirm Upload Completion
- **`POST /api/v1/employee-documents/:documentId/confirm`**
- **Request Body (optional):**
  ```json
  {
    "storagePath": "org-00000000/employee-docs/00000002/uuid/resume.pdf"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "data": {
      "id": "c62b9a11-8271-4770-b749-65bc04e0e5a9",
      "is_upload_confirmed": true,
      "extraction_status": "pending",
      "updated_at": "2026-10-30T12:01:00Z"
    }
  }
  ```

---

### 2.4 Get Document Metadata
- **`GET /api/v1/employee-documents/:documentId`**
- **Behavior:** Enforces role-based permissions; logs `view` event in `audit_logs`.
- **Response (200 OK):** Document metadata with `extracted_data`.

---

### 2.5 Generate Presigned Download URL
- **`GET /api/v1/employee-documents/:documentId/download-url`**
- **Behavior:** Generates a 5-minute signed URL from Supabase Storage; logs `download` event in `audit_logs`.
- **Response (200 OK):**
  ```json
  {
    "data": {
      "documentId": "c62b9a11-8271-4770-b749-65bc04e0e5a9",
      "downloadUrl": "https://storage.supabase.co/object/sign/employee-documents/...",
      "expiresIn": 300
    }
  }
  ```

---

### 2.6 Update Document Metadata
- **`PATCH /api/v1/employee-documents/:documentId`**
- **Request Body:**
  ```json
  {
    "title": "New Title",
    "description": "Updated notes",
    "visibility": "internal"
  }
  ```
- **Response (200 OK):** Updated document object.

---

### 2.7 Verify / Reject Document
- **`POST /api/v1/employee-documents/:documentId/verify`**
- **Access:** Admin, Owner, or HR.
- **Request Body:**
  ```json
  {
    "status": "verified",
    "notes": "Verified against accredited university register"
  }
  ```
- **Behavior:** Updates `verification_status`, `verified_by`, `verified_at`; logs `verify` event in `audit_logs`.

---

### 2.8 Trigger / Record AI Extraction
- **`POST /api/v1/employee-documents/:documentId/extract`**
- **Behavior:** Extracts or records structured fields (skills, experience, summary); sets `extraction_status: 'completed'`; logs `extract` event in `audit_logs`.

---

### 2.9 Soft Delete Document
- **`DELETE /api/v1/employee-documents/:documentId`**
- **Behavior:** Sets `deleted_at: NOW()`; logs `delete` event in `audit_logs`.
- **Response (200 OK):** `{ "success": true }`

---

### 2.10 List Documents by Employee Profile
- **`GET /api/v1/employee-documents/employee/:employeeProfileId`**
- **Behavior:** Lists all non-deleted documents for the specified profile.
