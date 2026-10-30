-- =============================================================================
-- Migration 006: In-App Notifications & User Notification Preferences
-- =============================================================================
-- Creates:
--   • notifications              — in-app alerts, mentions, task/ticket assignments
--   • notification_preferences   — user-configured delivery channels and categories
-- =============================================================================

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     UUID         NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  recipient_id        UUID         NOT NULL,
  actor_id            UUID,

  -- Categorisation & content
  category            VARCHAR(50)  NOT NULL
    CHECK (category IN ('task', 'ticket', 'mention', 'meeting', 'approval', 'system', 'project', 'document', 'agent')),
  title               VARCHAR(255) NOT NULL,
  body                TEXT         NOT NULL,
  link_url            TEXT,
  resource_type       VARCHAR(50),
  resource_id         UUID,
  priority            VARCHAR(20)  NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Read status
  is_read             BOOLEAN      NOT NULL DEFAULT FALSE,
  read_at             TIMESTAMPTZ,
  metadata            JSONB,

  -- Audit & Lifecycle
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_active
  ON notifications (recipient_id, is_read, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_org
  ON notifications (organisation_id);

CREATE INDEX IF NOT EXISTS idx_notifications_category
  ON notifications (category);

-- ---------------------------------------------------------------------------
-- notification_preferences
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_preferences (
  id                    UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id       UUID         NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id               UUID         NOT NULL,

  -- Channels
  email_notifications   BOOLEAN      NOT NULL DEFAULT TRUE,
  in_app_notifications  BOOLEAN      NOT NULL DEFAULT TRUE,

  -- Event categories
  task_assigned         BOOLEAN      NOT NULL DEFAULT TRUE,
  ticket_updates        BOOLEAN      NOT NULL DEFAULT TRUE,
  mentions              BOOLEAN      NOT NULL DEFAULT TRUE,
  approval_requests     BOOLEAN      NOT NULL DEFAULT TRUE,
  system_announcements  BOOLEAN      NOT NULL DEFAULT TRUE,
  daily_digest          BOOLEAN      NOT NULL DEFAULT FALSE,

  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE (organisation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user
  ON notification_preferences (user_id, organisation_id);
