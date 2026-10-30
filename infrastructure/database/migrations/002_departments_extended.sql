-- Migration: 002_departments_extended
-- Extends the departments table with description, head_id,
-- parent_department_id, created_by and deleted_at columns.
-- Adds the department_members join table.

-- Extend departments table (columns may already exist on fresh deploys, use IF NOT EXISTS guards)
ALTER TABLE departments
  ADD COLUMN IF NOT EXISTS description           TEXT,
  ADD COLUMN IF NOT EXISTS head_id               UUID REFERENCES employee_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS parent_department_id  UUID REFERENCES departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by            UUID,
  ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at            TIMESTAMPTZ;

-- Ensure a unique, case-insensitive name per organisation (active departments only)
CREATE UNIQUE INDEX IF NOT EXISTS departments_org_name_unique
  ON departments (organisation_id, lower(name))
  WHERE deleted_at IS NULL;

-- Members of a department
CREATE TABLE IF NOT EXISTS department_members (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id        UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    employee_profile_id  UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    role                 VARCHAR(50) NOT NULL DEFAULT 'member',  -- 'head' | 'member'
    added_at             TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (department_id, employee_profile_id)
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_departments_organisation_id ON departments (organisation_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_department_members_dept     ON department_members (department_id);
CREATE INDEX IF NOT EXISTS idx_department_members_profile  ON department_members (employee_profile_id);

-- organisation_members table (needed for user context resolution)
-- Tracks which Supabase auth users belong to which organisation and with what role.
CREATE TABLE IF NOT EXISTS organisation_members (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id  UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id          UUID NOT NULL,               -- Supabase auth.users.id
    role             VARCHAR(50) NOT NULL DEFAULT 'member',  -- 'owner' | 'admin' | 'member' | 'guest'
    joined_at        TIMESTAMPTZ DEFAULT NOW(),
    left_at          TIMESTAMPTZ,                 -- NULL means still active
    UNIQUE (organisation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organisation_members (user_id) WHERE left_at IS NULL;
