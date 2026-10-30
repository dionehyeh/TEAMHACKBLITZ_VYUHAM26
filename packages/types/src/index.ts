/**
 * Core Domain Types for BizContext AI
 * Mapped directly to Section 8 of IMPLEMENTATION.md
 */

export type EntityId = string;

export interface BaseEntity {
  id: EntityId;
  organisationId: EntityId;
  createdBy: EntityId;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// 8.1 Core Organisation and People
export interface Organisation {
  id: EntityId;
  name: string;
  slug: string;
  parentId?: EntityId | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeProfile extends BaseEntity {
  userId: EntityId;
  firstName: string;
  lastName: string;
  workEmail: string;
  departmentId?: EntityId;
  designation?: string;
  skills: Array<{
    name: string;
    proficiency: "beginner" | "intermediate" | "expert";
    verified: boolean;
  }>;
  employmentStatus: "active" | "invited" | "suspended" | "offboarded";
}

// 8.2 Knowledge and Asset
export interface KnowledgePage extends BaseEntity {
  title: string;
  slug: string;
  content: string; // Markdown or block structure
  parentId?: EntityId | null;
  visibility: "public" | "internal" | "restricted";
}

export interface StoredFile extends BaseEntity {
  filename: string;
  byteSize: number;
  mimeType: string;
  storagePath: string;
  visibility: "public" | "internal" | "restricted";
}

// 8.3 Work & Collaboration
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: "planning" | "active" | "paused" | "completed";
  ownerId: EntityId;
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  projectId?: EntityId;
  primaryAssigneeId?: EntityId;
  collaboratorIds: EntityId[];
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "blocked" | "in_review" | "done" | "cancelled";
  dueDate?: string;
}

export interface Ticket extends BaseEntity {
  ticketNumber: string;
  title: string;
  description: string;
  category: "it" | "access" | "infrastructure" | "hr" | "design" | "dev" | "finance" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status:
    | "open"
    | "assigned"
    | "acknowledged"
    | "in_progress"
    | "waiting"
    | "resolved"
    | "closed"
    | "reopened";
  requesterId: EntityId;
  assigneeId?: EntityId;
  slaTarget?: string;
}

export interface Meeting extends BaseEntity {
  title: string;
  agenda?: string;
  meetingDate: string;
  participantIds: EntityId[];
  projectId?: EntityId;
  minutesContent?: string;
}

// 8.4 AI, Agent & Browser
export type BrowserPermissionLevel = "B0" | "B1" | "B2" | "B3" | "B4";

export interface AgentRecord extends BaseEntity {
  name: string;
  description: string;
  instructions: string;
  model: string;
  browserPermission: BrowserPermissionLevel;
  status: "draft" | "submitted" | "reviewed" | "approved" | "active" | "suspended" | "retired";
  allowedDomains: string[];
}

export interface BrowserJob extends BaseEntity {
  agentId: EntityId;
  goal: string;
  targetUrl: string;
  permissionLevel: BrowserPermissionLevel;
  status:
    | "queued"
    | "policy_check"
    | "running"
    | "awaiting_approval"
    | "completed"
    | "failed"
    | "cancelled";
  evidenceUrls: string[];
}
