-- =============================================================================
-- Migration 004: Asset Storage Files, Versions & Permissions
-- =============================================================================
-- Creates:
--   • files            — stores central asset/file metadata; bytes in object storage
--   • file_versions    — historical versions of files
--   • file_permissions — explicit sharing grants (user, role, or department)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- files
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS files (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     UUID         NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id          UUID         REFERENCES projects(id) ON DELETE SET NULL,

  -- File details & hierarchy
  filename            VARCHAR(500) NOT NULL,
  folder_path         TEXT         NOT NULL DEFAULT '/',
  byte_size           BIGINT       NOT NULL CHECK (byte_size >= 0),
  mime_type           VARCHAR(100) NOT NULL,

  -- Storage
  storage_path        TEXT         NOT NULL,   -- Object storage path (never exposed publicly)
  is_upload_confirmed BOOLEAN      NOT NULL DEFAULT FALSE,

  -- Visibility & sharing
  visibility          VARCHAR(50)  NOT NULL DEFAULT 'internal'
    CHECK (visibility IN ('public', 'internal', 'restricted')),

  -- Organization & metadata
  tags                TEXT[]       NOT NULL DEFAULT '{}',
  summary             TEXT,

  -- OCR & Ingestion (Section 2.4)
  ocr_status          VARCHAR(50)  NOT NULL DEFAULT 'none'
    CHECK (ocr_status IN ('none', 'pending', 'processing', 'completed', 'failed')),
  ocr_text            TEXT,

  -- Audit columns
  created_by          UUID         NOT NULL,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ               -- soft-delete sentinel
);

-- ---------------------------------------------------------------------------
-- Indexes for files
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_files_organisation_id
  ON files (organisation_id);

CREATE INDEX IF NOT EXISTS idx_files_project_id
  ON files (project_id);

CREATE INDEX IF NOT EXISTS idx_files_created_by
  ON files (created_by);

CREATE INDEX IF NOT EXISTS idx_files_visibility
  ON files (visibility);

CREATE INDEX IF NOT EXISTS idx_files_folder_path
  ON files (folder_path);

CREATE INDEX IF NOT EXISTS idx_files_org_active
  ON files (organisation_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- file_versions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS file_versions (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id             UUID         NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  version_number      INT          NOT NULL DEFAULT 1,
  storage_path        TEXT         NOT NULL,
  byte_size           BIGINT       NOT NULL CHECK (byte_size >= 0),
  created_by          UUID         NOT NULL,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_file_versions_file_id
  ON file_versions (file_id, version_number DESC);

-- ---------------------------------------------------------------------------
-- file_permissions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS file_permissions (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id             UUID         NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  grantee_type        VARCHAR(50)  NOT NULL CHECK (grantee_type IN ('user', 'role', 'department')),
  grantee_id          UUID         NOT NULL,
  permission          VARCHAR(50)  NOT NULL CHECK (permission IN ('view', 'download', 'edit', 'admin')),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (file_id, grantee_type, grantee_id, permission)
);

CREATE INDEX IF NOT EXISTS idx_file_permissions_file_id
  ON file_permissions (file_id);

CREATE INDEX IF NOT EXISTS idx_file_permissions_grantee
  ON file_permissions (grantee_type, grantee_id);
