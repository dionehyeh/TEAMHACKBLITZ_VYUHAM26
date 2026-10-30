-- =============================================================================
-- Migration 005: Extended Tickets, Comments & SLA Tracking
-- =============================================================================
-- Extends:
--   • tickets           — adds SLA targets, breach flag, department, and resolution
-- Creates:
--   • ticket_comments   — discussion thread and resolution notes per ticket
--   • ticket_activity   — audit and lifecycle transition log
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Alter tickets table
-- ---------------------------------------------------------------------------
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS department_id     UUID REFERENCES departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sla_target        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_breached      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS resolution_notes  TEXT,
  ADD COLUMN IF NOT EXISTS resolved_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at        TIMESTAMPTZ;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_organisation_id
  ON tickets (organisation_id);

CREATE INDEX IF NOT EXISTS idx_tickets_status
  ON tickets (status);

CREATE INDEX IF NOT EXISTS idx_tickets_category
  ON tickets (category);

CREATE INDEX IF NOT EXISTS idx_tickets_priority
  ON tickets (priority);

CREATE INDEX IF NOT EXISTS idx_tickets_assignee_id
  ON tickets (assignee_id);

CREATE INDEX IF NOT EXISTS idx_tickets_requester_id
  ON tickets (requester_id);

CREATE INDEX IF NOT EXISTS idx_tickets_sla_target
  ON tickets (sla_target);

-- ---------------------------------------------------------------------------
-- ticket_comments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_comments (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id           UUID         NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id           UUID         NOT NULL,
  author_name         VARCHAR(255) NOT NULL,
  avatar              TEXT,
  text                TEXT         NOT NULL,
  is_internal         BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id
  ON ticket_comments (ticket_id, created_at ASC);

-- ---------------------------------------------------------------------------
-- ticket_activity
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_activity (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id           UUID         NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  actor_id            UUID         NOT NULL,
  action              VARCHAR(100) NOT NULL,
  details             JSONB,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_activity_ticket_id
  ON ticket_activity (ticket_id, created_at DESC);
