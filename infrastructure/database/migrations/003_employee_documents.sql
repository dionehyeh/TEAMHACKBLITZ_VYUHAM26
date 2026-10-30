-- =============================================================================
-- Migration 003: Employee Documents & Audit Logs
-- =============================================================================
-- Creates:
--   • employee_documents  — stores document metadata; actual bytes are in
--                           Supabase Storage under the 'employee-documents' bucket
--   • audit_logs          — immutable append-only log for sensitive access events
-- =============================================================================

-- ---------------------------------------------------------------------------
-- employee_documents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_documents (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     UUID        NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  employee_profile_id UUID        NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,

  -- Classification
  document_type       VARCHAR(50)  NOT NULL
    CHECK (document_type IN ('cv', 'certificate', 'portfolio', 'other')),
  title               VARCHAR(255) NOT NULL,
  description         TEXT,

  -- Storage
  storage_path        TEXT         NOT NULL,   -- Supabase Storage object path (never exposed publicly)
  filename            VARCHAR(500) NOT NULL,
  mime_type           VARCHAR(100) NOT NULL,
  byte_size           BIGINT       NOT NULL CHECK (byte_size > 0),

  -- Upload lifecycle
  is_upload_confirmed BOOLEAN      NOT NULL DEFAULT FALSE,

  -- Verification workflow
  verification_status VARCHAR(50)  NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'verified', 'rejected')),
  verified_by         UUID,                    -- auth user id of the reviewer
  verified_at         TIMESTAMPTZ,

  -- AI extraction pipeline
  extraction_status   VARCHAR(50)  NOT NULL DEFAULT 'pending'
    CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  extracted_data      JSONB,                   -- AI-extracted fields; unverified until confirmed

  -- Visibility
  visibility          VARCHAR(50)  NOT NULL DEFAULT 'restricted'
    CHECK (visibility IN ('restricted', 'internal')),

  -- Audit columns
  created_by          UUID         NOT NULL,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ               -- soft-delete sentinel
);

-- ---------------------------------------------------------------------------
-- Indexes for employee_documents
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_employee_documents_organisation_id
  ON employee_documents (organisation_id);

CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_profile_id
  ON employee_documents (employee_profile_id);

CREATE INDEX IF NOT EXISTS idx_employee_documents_document_type
  ON employee_documents (document_type);

CREATE INDEX IF NOT EXISTS idx_employee_documents_verification_status
  ON employee_documents (verification_status);

CREATE INDEX IF NOT EXISTS idx_employee_documents_extraction_status
  ON employee_documents (extraction_status);

-- Partial index: quickly find non-deleted documents per organisation
CREATE INDEX IF NOT EXISTS idx_employee_documents_org_active
  ON employee_documents (organisation_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id  UUID         NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  actor_id         UUID         NOT NULL,   -- auth user id performing the action
  resource_type    VARCHAR(100) NOT NULL,   -- e.g. 'employee_document'
  resource_id      UUID         NOT NULL,
  action           VARCHAR(100) NOT NULL,   -- e.g. 'view', 'download', 'verify', 'delete'
  metadata         JSONB,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes for audit_logs
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_audit_logs_organisation_id
  ON audit_logs (organisation_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
  ON audit_logs (resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id
  ON audit_logs (actor_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON audit_logs (created_at DESC);
